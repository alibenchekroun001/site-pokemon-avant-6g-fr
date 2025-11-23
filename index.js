// Assure-toi que <script src="index.js" defer></script> ou que le script est chargé après le HTML.

// ---------- Données ----------
const TYPES = [
  'Normal','Feu','Eau','Électrik','Plante','Glace','Combat','Poison','Sol','Vol',
  'Psy','Insecte','Roche','Spectre','Dragon','Ténèbres','Acier','Fée'
];

const TYPE_CHART = {
  Normal: { Roche:0.5, Spectre:0, Acier:0.5 },
  Feu: { Feu:0.5, Eau:0.5, Plante:2, Glace:2, Insecte:2, Roche:0.5, Dragon:0.5, Acier:2 },
  Eau: { Feu:2, Eau:0.5, Plante:0.5, Sol:2, Roche:2, Dragon:0.5 },
  Électrik: { Eau:2, Électrik:0.5, Plante:0.5, Sol:0, Vol:2, Dragon:0.5 },
  Plante: { Feu:0.5, Eau:2, Plante:0.5, Poison:0.5, Sol:2, Vol:0.5, Insecte:0.5, Roche:2, Dragon:0.5, Acier:0.5 },
  Glace: { Feu:0.5, Eau:0.5, Plante:2, Sol:2, Vol:2, Dragon:2, Acier:0.5, Glace:0.5 },
  Combat: { Normal:2, Glace:2, Roche:2, Ténèbres:2, Acier:2, Poison:0.5, Vol:0.5, Psy:0.5, Insecte:0.5, Fée:0.5, Spectre:0 },
  Poison: { Plante:2, Poison:0.5, Sol:0.5, Roche:0.5, Spectre:0.5, Acier:0, Fée:2 },
  Sol: { Feu:2, Électrik:2, Plante:0.5, Poison:2, Vol:0, Insecte:0.5, Roche:2, Acier:2 },
  Vol: { Électrik:0.5, Plante:2, Combat:2, Insecte:2, Roche:0.5, Acier:0.5 },
  Psy: { Combat:2, Poison:2, Psy:0.5, Ténèbres:0, Acier:0.5 },
  Insecte: { Feu:0.5, Plante:2, Combat:0.5, Poison:0.5, Vol:0.5, Psy:2, Spectre:0.5, Ténèbres:2, Acier:0.5, Fée:0.5 },
  Roche: { Feu:2, Glace:2, Combat:0.5, Sol:0.5, Vol:2, Insecte:2, Acier:0.5 },
  Spectre: { Normal:0, Psy:2, Spectre:2, Ténèbres:0.5 },
  Dragon: { Dragon:2, Acier:0.5, Fée:0 },
  Ténèbres: { Combat:0.5, Psy:2, Spectre:2, Ténèbres:0.5, Fée:0.5 },
  Acier: { Feu:0.5, Eau:0.5, Électrik:0.5, Glace:2, Roche:2, Fée:2, Acier:0.5 },
  Fée: { Feu:0.5, Combat:2, Poison:0.5, Dragon:2, Ténèbres:2, Acier:0.5 }
};

// ---------- Utilitaires ----------
function getMultiplier(attacker, defender){
  const m = TYPE_CHART[attacker];
  if(!m) return 1;
  return m[defender] ?? 1;
}

function animateIn(el, opts = {}) {
  // simple fade + slide animation controlled in JS so you don't need to modify CSS
  const { fromY = 12, fromX = 0, delay = 10, duration = 300 } = opts;
  el.style.opacity = '0';
  el.style.transform = `translate(${fromX}px, ${fromY}px)`;
  el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  // small delay to ensure transition triggers
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(0,0)';
    }, delay);
  });
}

// pulse animation for button feedback
function pulseButton(btn){
  btn.style.transition = 'transform 140ms ease';
  btn.style.transform = 'scale(1.05)';
  setTimeout(() => btn.style.transform = 'scale(1)', 140);
}

// ---------- DOM helpers ----------
function clearAndFocus(container){
  container.innerHTML = '';
  container.scrollTop = 0;
}

function make(titleText){
  const el = document.createElement('div');
  el.className = 'center';
  el.innerHTML = `<h2>${titleText}</h2>`;
  return el;
}

// ---------- Création de la grille ----------
function createTypeGrid(container, onClick, small=false){
  const grid = document.createElement('div');
  grid.className = 'type-grid';
  if (small) grid.style.maxWidth = '480px';
  TYPES.forEach(t => {
    const cell = document.createElement('div');
    cell.className = `type-cell type-${t}` + (small ? ' small' : '');
    cell.textContent = t;
    cell.dataset.type = t;
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', (e) => {
      pulseButton(cell);
      onClick(t);
    });
    grid.appendChild(cell);
    // anime chaque cellule avec un léger décalage
    animateIn(cell, { fromY: 8, delay: 15 * (TYPES.indexOf(t) % 6) });
  });
  container.appendChild(grid);
  animateIn(grid, { fromY: 10, delay: 0 });
}

// ---------- Affichage des résultats ----------
function showResults(parent, lists, modeLabel){
  clearAndFocus(parent);
  const wrapper = document.createElement('div');
  wrapper.className = 'result-row';

  function makePanel(title, items){
    const p = document.createElement('div');
    p.className = 'panel';
    p.style.opacity = '0';
    const h = document.createElement('h3'); h.textContent = title;
    p.appendChild(h);
    const g = document.createElement('div'); g.className = 'grid';
    items.forEach(it => {
      const pill = document.createElement('div');
      pill.className = `type-pill type-${it.type}`;
      pill.innerHTML = `<span>${it.type}</span><span class='mult'>${it.mult}</span>`;
      g.appendChild(pill);
    });
    p.appendChild(g);
    return p;
  }

  const p1 = makePanel('Super Efficace (x2 ou x4)', lists.forces);
  const p2 = makePanel('Peu Efficace/Immunisé (x0, x0.25, x0.5)', lists.weaknesses);
  const p3 = makePanel('Neutre (x1)', lists.neutral);

  wrapper.appendChild(p1);
  wrapper.appendChild(p2);
  wrapper.appendChild(p3);

  parent.appendChild(wrapper);

  // anime les panneaux avec un léger décalage
  [p1,p2,p3].forEach((p, i) => {
    setTimeout(() => animateIn(p, { fromX: 14, duration: 360 }), i * 90);
  });
}

// ---------- Modes ----------
function attackMode(root){
  clearAndFocus(root);
  root.appendChild(make('Mode Attaque — Choisissez un Type Attaquant'));
  createTypeGrid(root, (type) => {
    // calcule pour chaque défense
    const forces = [], weaknesses = [], neutral = [];
    TYPES.forEach(def => {
      const m = getMultiplier(type, def);
      if(m === 2) forces.push({type:def, mult:'x2'});
      else if(m === 0.5) weaknesses.push({type:def, mult:'x0.5'});
      else if(m === 0) weaknesses.push({type:def, mult:'x0'});
      else neutral.push({type:def, mult:'x1'});
    });
    showResults(root, {forces, weaknesses, neutral}, 'attaque');
  });
}

function defenseSingleMode(root){
  clearAndFocus(root);
  root.appendChild(make('Mode Défense (1 type) — Choisissez un Type Défenseur'));
  createTypeGrid(root, (type) => {
    // forces stockera les "faiblesses de défense" (Super Efficace: x2) 
    // weaknesses stockera les "résistances de défense" (Peu Efficace/Immunisé: x0, x0.5)
    const forces = [], weaknesses = [], neutral = []; 
    TYPES.forEach(att => {
      const m = getMultiplier(att, type);
      
      // ECHANGE: si l'attaque est SUPER EFFICACE (x2) pour la défense -> Va dans la case "Super Efficace (x2 ou x4)"
      if(m === 2) forces.push({type:att, mult:'x2'}); 
      
      // ECHANGE: si l'attaque est PEU EFFICACE/IMMUNISÉE (x0, x0.5) pour la défense -> Va dans la case "Peu Efficace/Immunisé (x0, x0.25, x0.5)"
      else if(m === 0 || m === 0.5) weaknesses.push({type:att, mult: m===0 ? 'x0' : 'x0.5'}); 
      
      else neutral.push({type:att, mult:'x1'});
    });
    // showResults affiche forces dans le 1er panneau et weaknesses dans le 2ème. Les listes ont été ajustées ci-dessus.
    showResults(root, {forces, weaknesses, neutral}, 'defense-single');
  });
}

function defenseDoubleMode(root){
  clearAndFocus(root);
  root.appendChild(make('Mode Défense (2 types) — Choisissez le premier type'));
  createTypeGrid(root, (first) => {
    // show second selection (small grid)
    clearAndFocus(root);
    const info = document.createElement('div'); info.className='center';
    info.innerHTML = `<h2>Choisissez le deuxième type (1er: ${first})</h2>`;
    root.appendChild(info);
    createTypeGrid(root, (second) => {
      // forces stockera les "faiblesses de défense" (Super Efficace: x2, x4)
      // weaknesses stockera les "résistances de défense" (Peu Efficace/Immunisé: x0, x0.25, x0.5)
      const forces = [], weaknesses = [], neutral = [];
      TYPES.forEach(att => {
        const m1 = getMultiplier(att, first);
        const m2 = getMultiplier(att, second);
        const mult = +(m1 * m2); // numeric
        
        // ECHANGE: si l'attaque est SUPER EFFICACE (x2 ou x4) pour la défense -> Va dans la case "Super Efficace (x2 ou x4)"
        if(mult === 2 || mult === 4){
          let label = mult === 4 ? 'x4' : 'x2';
          forces.push({type:att, mult:label}); 
        
        // ECHANGE: si l'attaque est PEU EFFICACE/IMMUNISÉE (x0, x0.25, x0.5) pour la défense -> Va dans la case "Peu Efficace/Immunisé (x0, x0.25, x0.5)"
        } else if(mult === 0 || mult === 0.5 || mult === 0.25){
          let label = 'x' + mult;
          if(mult === 0.5) label = 'x0.5';
          if(mult === 0.25) label = 'x0.25';
          if(mult === 0) label = 'x0';
          weaknesses.push({type:att, mult:label}); 
        } else {
          neutral.push({type:att, mult:'x1'});
        }
      });
      // showResults affiche forces dans le 1er panneau et weaknesses dans le 2ème. Les listes ont été ajustées ci-dessus.
      showResults(root, {forces, weaknesses, neutral}, 'defense-double');
    });
  });
}

// ---------- Initial wiring ----------
window.addEventListener('DOMContentLoaded', () => {
  const attackBtn = document.getElementById('attack-btn');
  const defenseBtn = document.getElementById('defense-btn');
  const app = document.getElementById('app');

  if(!attackBtn || !defenseBtn || !app){
    console.error('Éléments manquants dans le HTML : vérifiez les IDs attack-btn, defense-btn, app');
    return;
  }

  attackBtn.addEventListener('click', (e) => { pulseButton(attackBtn); attackMode(app); });
  defenseBtn.addEventListener('click', (e) => {
    pulseButton(defenseBtn);
    // show defense choice
    app.innerHTML = '';
    const c = document.createElement('div'); c.className='center';
    c.innerHTML = '<h2>Mode Défense — Choisissez 1 ou 2 types</h2>';
    app.appendChild(c);
    const controls = document.createElement('div'); controls.className='controls';
    const single = document.createElement('button'); single.className='small-btn'; single.textContent='Un seul type';
    const two = document.createElement('button'); two.className='small-btn'; two.textContent='Deux types';
    controls.appendChild(single); controls.appendChild(two);
    app.appendChild(controls);

    single.addEventListener('click', (ev) => { pulseButton(single); defenseSingleMode(app); });
    two.addEventListener('click', (ev) => { pulseButton(two); defenseDoubleMode(app); });

    animateIn(controls, { fromY: 8 });
  });

  // auto-open attaque par défaut
  attackMode(app);
});