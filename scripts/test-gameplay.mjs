// Autonomous full-flow verification script for Umbral Echoes ARPG using Chrome DevTools Protocol
import { spawn } from 'child_process';
import fs from 'fs';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTest() {
  console.log('--- Starting Chrome with Remote Debugging ---');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--window-size=1280,720',
    '--disable-gpu',
    'http://localhost:3000/',
  ]);

  chromeProc.stderr.on('data', (d) => {
    // suppress noise
  });

  await sleep(2500);

  // Fetch debugging WebSocket
  let wsUrl = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      const list = await res.json();
      const page = list.find((p) => p.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      await sleep(1000);
    }
  }

  if (!wsUrl) {
    console.error('Failed to find Chrome WebSocket debugging endpoint');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome DevTools WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pendingRequests = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        console.error('[Browser Console Error]', text);
        consoleErrors.push(text);
      }
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[Browser Exception]', msg.params.exceptionDetails);
      consoleErrors.push(JSON.stringify(msg.params.exceptionDetails));
    }
    if (msg.id && pendingRequests.has(msg.id)) {
      const resolve = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      resolve(msg);
    }
  };

  await new Promise((res) => (ws.onopen = res));

  async function send(method, params = {}) {
    const id = msgId++;
    const payload = { id, method, params };
    return new Promise((resolve) => {
      pendingRequests.set(id, resolve);
      ws.send(JSON.stringify(payload));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  async function evalExpr(expression) {
    const trimmed = expression.trim();
    const wrapped = `(() => {\n  return eval(${JSON.stringify(trimmed)});\n})()`;
    const res = await send('Runtime.evaluate', {
      expression: wrapped,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.result?.exceptionDetails) {
      console.error('Eval Exception Details:', res.result.exceptionDetails);
    }
    return res.result?.result?.value;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    if (res.result?.data) {
      fs.writeFileSync(filename, Buffer.from(res.result.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
    }
  }

  console.log('\n--- Step 1: Verify Boot and Main Menu ---');
  let activeScene = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    activeScene = await evalExpr(`
      if (window.game && window.game.scene) {
        const active = window.game.scene.scenes.find(s => s.scene.isActive());
        active ? active.scene.key : null;
      } else {
        null;
      }
    `);
    if (activeScene === 'MainMenuScene') break;
  }
  console.log('Active Scene:', activeScene);
  if (activeScene !== 'MainMenuScene') {
    throw new Error(`Expected MainMenuScene, but got ${activeScene}`);
  }

  console.log('\n--- Step 2: Transition to CharacterSelectScene ---');
  await evalExpr(`
    const menu = window.game.scene.getScene('MainMenuScene');
    menu.scene.start('CharacterSelectScene');
  `);
  await sleep(800);
  await captureScreenshot('screenshot_char_select.png');

  console.log('\n--- Step 3: Start Game as Vanguard and Enter Town ---');
  await evalExpr(`
    const select = window.game.scene.getScene('CharacterSelectScene');
    select.scene.start('GameScene', { className: 'vanguard', loadFromSave: false });
  `);
  await sleep(1000);

  const gameSceneInfo = await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    ({
      areaName: gs.areaManager.currentArea.name,
      isTown: gs.areaManager.currentArea.isTown,
      playerClass: gs.player.className,
      hp: gs.player.hp,
      maxHp: gs.player.maxHp,
      resource: gs.player.resource,
      maxResource: gs.player.maxResource,
      potionsHp: gs.player.inventory.hpPotions,
      potionsMana: gs.player.inventory.manaPotions,
      gold: gs.player.inventory.gold,
      npcCount: gs.npcsGroup ? gs.npcsGroup.getLength() : 0,
      questCount: gs.questManager.quests.length
    })
  `);
  console.log('GameScene Town State:', gameSceneInfo);
  if (gameSceneInfo.areaName !== 'Oakhaven Refuge' || !gameSceneInfo.isTown) {
    throw new Error('Player did not start in Oakhaven Refuge!');
  }
  await captureScreenshot('screenshot_town.png');

  console.log('\n--- Step 4: Test UI Modals in Town ---');
  // Open Inventory
  await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    gs.inventoryUI.toggle();
  `);
  await sleep(400);
  const invOpen = await evalExpr(`window.game.scene.getScene('GameScene').inventoryUI.visible`);
  console.log('Inventory Visible:', invOpen);
  if (!invOpen) throw new Error('Inventory UI did not open');
  await evalExpr(`window.game.scene.getScene('GameScene').inventoryUI.close()`);

  // Open Character Sheet
  await evalExpr(`window.game.scene.getScene('GameScene').characterUI.toggle()`);
  await sleep(400);
  const charOpen = await evalExpr(`window.game.scene.getScene('GameScene').characterUI.visible`);
  console.log('Character Sheet Visible:', charOpen);
  if (!charOpen) throw new Error('Character UI did not open');
  await evalExpr(`window.game.scene.getScene('GameScene').characterUI.close()`);

  // Open Skill Tree
  await evalExpr(`window.game.scene.getScene('GameScene').skillTreeUI.toggle()`);
  await sleep(400);
  const skillOpen = await evalExpr(`window.game.scene.getScene('GameScene').skillTreeUI.visible`);
  console.log('Skill Tree Visible:', skillOpen);
  if (!skillOpen) throw new Error('Skill Tree UI did not open');
  await evalExpr(`window.game.scene.getScene('GameScene').skillTreeUI.close()`);

  console.log('\n--- Step 5: Step Through Portal into Ashen Outskirts ---');
  await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    gs.loadArea('outskirts', 100, 380);
  `);
  await sleep(1000);

  const combatFieldInfo = await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    ({
      areaName: gs.areaManager.currentArea.name,
      isTown: gs.areaManager.currentArea.isTown,
      enemiesCount: gs.enemiesGroup.getLength()
    })
  `);
  console.log('Combat Field State:', combatFieldInfo);
  if (combatFieldInfo.areaName !== 'Ashen Outskirts' || combatFieldInfo.enemiesCount === 0) {
    throw new Error('Outskirts did not load enemies!');
  }
  await captureScreenshot('screenshot_combat_field.png');

  console.log('\n--- Step 6: Test Combat, Kills, and Loot Drops ---');
  const killResult = await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    const firstEnemy = gs.enemiesGroup.getChildren()[0];
    // Move player into melee range of the enemy
    gs.player.setPosition(firstEnemy.x - 45, firstEnemy.y);
    const initHp = firstEnemy.hp;

    // Player executes Cleave
    gs.combatSystem.executeSkill('cleave', firstEnemy.x, firstEnemy.y, gs.enemiesGroup, null);
    const hpAfterCleave = firstEnemy.hp;

    // Apply lethal damage to trigger death and loot drop
    gs.combatSystem.applyPlayerDamage(firstEnemy, 500, 'physical');

    ({
      initialHp: initHp,
      hpAfterCleave: hpAfterCleave,
      damageDealt: initHp - hpAfterCleave,
      dropItemsCount: gs.combatSystem.dropItems.getLength(),
      playerExp: gs.player.exp,
      furyGained: gs.player.resource
    })
  `);
  console.log('Combat Cleave & Kill Result:', killResult);
  if (killResult.damageDealt <= 0 || killResult.dropItemsCount === 0) {
    throw new Error('Combat skill did not deal damage or drop loot!');
  }

  console.log('\n--- Step 7: Test Level Up & Skill Learning ---');
  const levelUpResult = await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    gs.player.addExp(300); // Level up
    const lvl = gs.player.level;
    const pts = gs.player.skillManager.skillPoints;

    // Learn Iron Will passive
    const learned = gs.player.skillManager.unlockSkill('iron_will', gs.player.level);
    gs.player.recalculateStats();

    ({
      newLevel: lvl,
      pointsRemaining: gs.player.skillManager.skillPoints,
      learnedIronWill: learned,
      updatedMaxHp: gs.player.maxHp
    })
  `);
  console.log('Level Up & Skill Learn Result:', levelUpResult);
  if (levelUpResult.newLevel < 2 || !levelUpResult.learnedIronWill) {
    throw new Error('Level up or skill learn failed!');
  }

  console.log('\n--- Step 8: Test Save and Restore to LocalStorage ---');
  const saveResult = await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    gs.player.inventory.gold += 250;
    gs.pauseMenuUI.onSaveCallback();
    const loaded = JSON.parse(localStorage.getItem('umbral_echoes_save_v1'));
    ({
      savedSuccessfully: loaded !== null,
      loadedLevel: loaded ? loaded.player.level : null,
      loadedGold: loaded ? loaded.player.inventory.gold : null,
      loadedArea: loaded ? loaded.areaId : null
    })
  `);
  console.log('Save & Load Verification:', saveResult);
  if (!saveResult.savedSuccessfully || saveResult.loadedGold !== 300) {
    throw new Error('Save to localStorage failed or data corrupted!');
  }

  console.log('\n--- Step 9: Test Boss Encounter & Victory Ending ---');
  await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    gs.loadArea('abyss', 100, 600);
  `);
  await sleep(1000);

  const bossState = await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    ({
      bossName: gs.activeBoss ? gs.activeBoss.bossName : null,
      bossHp: gs.activeBoss ? gs.activeBoss.hp : null,
      bossPhase: gs.activeBoss ? gs.activeBoss.phase : null
    })
  `);
  console.log('Final Boss Encounter State:', bossState);
  if (bossState.bossName !== 'Malagath, the Void Sovereign') {
    throw new Error('Final boss Malagath failed to spawn in Abyssal Citadel!');
  }

  // Defeat final boss and trigger EndingScene
  console.log('Defeating Final Boss Malagath...');
  await evalExpr(`
    const gs = window.game.scene.getScene('GameScene');
    gs.combatSystem.applyPlayerDamage(gs.activeBoss, 9999, 'physical');
  `);
  await sleep(3500);

  const finalScene = await evalExpr(`
    const active = window.game.scene.scenes.find(s => s.scene.isActive());
    active ? active.scene.key : null;
  `);
  console.log('Scene after Final Boss Defeat:', finalScene);
  if (finalScene !== 'EndingScene') {
    throw new Error(`Expected EndingScene, got ${finalScene}`);
  }
  await captureScreenshot('screenshot_ending.png');

  console.log('\n--- Step 10: Check Browser Console Errors ---');
  if (consoleErrors.length > 0) {
    console.error('Console errors detected during run:', consoleErrors);
    throw new Error(`Browser console errors encountered: ${consoleErrors.join('; ')}`);
  } else {
    console.log('✓ ZERO console errors or unhandled exceptions detected!');
  }

  console.log('\n=============================================');
  console.log('ALL AUTONOMOUS VERIFICATION TESTS PASSED 100%!');
  console.log('=============================================');

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
