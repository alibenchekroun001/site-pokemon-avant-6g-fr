const TYPES = [
  'Normal','Plante','Feu','Eau','Électrik','Glace','Combat','Poison','Sol','Vol',
  'Psy','Insecte','Roche','Spectre','Dragon','Ténèbres','Acier','Fée'
];

const TYPE_CHART = {
  Normal: { Acier:0.5, Roche:0.5, Spectre:0 },
  Plante: { Eau:2, Roche:2, Sol:2, Acier:0.5, Dragon:0.5, Feu:0.5, Insecte:0.5, Plante:0.5, Poison:0.5, Vol:0.5 },
  Feu: { Acier:2, Glace:2, Insecte:2, Plante:2, Dragon:0.5, Eau:0.5, Feu:0.5, Roche:0.5 }, 
  Eau: { Feu:2, Roche:2, Sol:2, Dragon:0.5, Eau:0.5, Plante:0.5 },
  Électrik: { Eau:2, Vol:2, Dragon:0.5, Électrik:0.5, Plante:0.5, Sol:0 },
  Glace: { Dragon:2, Plante:2, Sol:2, Vol:2, Acier:0.5, Eau:0.5, Feu:0.5, Glace:0.5},
  Combat: { Acier:2, Glace:2, Normal:2, Roche:2, Ténèbres:2, Insecte:0.5, Poison:0.5, Psy:0.5, Vol:0.5, Spectre:0 }, 
  Poison: { Plante:2, Poison:0.5, Roche:0.5, Sol:0.5, Spectre:0.5, Acier:0 },
  Sol: { Acier:2, Électrik:2, Feu:2, Poison:2, Roche:2, Insecte:0.5, Plante:0.5, Vol:0 },
  Vol: { Combat:2, Insecte:2, Plante:2, Acier:0.5, Électrik:0.5, Roche:0.5 },
  Psy: { Combat:2, Poison:2, Acier:0.5, Psy:0.5, Ténèbres:0 },
  Insecte: { Plante:2, Psy:2, Ténèbres:2, Acier:0.5, Combat:0.5, Feu:0.5, Poison:0.5, Spectre:0.5, Vol:0.5 },
  Roche: { Feu:2, Glace:2, Insecte:2, Vol:2, Acier:0.5, Combat:0.5, Sol:0.5 },
  Spectre: { Psy:2, Spectre:2, Ténèbres:0.5, Normal:0 },
  Dragon: { Dragon:2, Acier:0.5 },
  Ténèbres: { Psy:2, Spectre:2, Combat:0.5, Ténèbres:0.5},
  Acier: { Glace:2, Roche:2, Acier:0.5, Eau:0.5, Électrik:0.5, Feu:0.5 },
  Fée: {  }
};

function getMultiplier(attacker, defender){
  const m = TYPE_CHART[attacker];
  if(!m) return 1;
  return m[defender] ?? 1;
}

function animateIn(el, opts = {}) {
  const { fromY = 12, fromX = 0, delay = 10, duration = 300 } = opts;
  el.style.opacity = '0';
  el.style.transform = `translate(${fromX}px, ${fromY}px)`;
  el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(0,0)';
    }, delay);
  });
}

function pulseButton(btn){
  btn.style.transition = 'transform 140ms ease';
  btn.style.transform = 'scale(1.05)';
  setTimeout(() => btn.style.transform = 'scale(1)', 140);
}

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
    animateIn(cell, { fromY: 8, delay: 15 * (TYPES.indexOf(t) % 6) });
  });
  container.appendChild(grid);
  animateIn(grid, { fromY: 10, delay: 0 });
}

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
  const p2 = makePanel('Peu Efficace (x0.25, x0.5)', lists.weaknesses);
  const p3 = makePanel('Immunisé (x0)', lists.neutral);

  wrapper.appendChild(p1);
  wrapper.appendChild(p2);
  wrapper.appendChild(p3);

  parent.appendChild(wrapper);

  [p1,p2,p3].forEach((p, i) => {
    setTimeout(() => animateIn(p, { fromX: 14, duration: 360 }), i * 90);
  });
}


function attackMode(root){
  clearAndFocus(root);
  root.appendChild(make('Mode Attaque — Choisissez un Type Attaquant'));
  createTypeGrid(root, (type) => {
    const forces = [], weaknesses = [], neutral = [];
    TYPES.forEach(def => {
      const m = getMultiplier(type, def);
      if(m === 2) forces.push({type:def, mult:'x2'});
      else if(m === 0.5) weaknesses.push({type:def, mult:'x0.5'});
      else if(m === 0) neutral.push({type:def, mult:'x0'}); 
    });
    showResults(root, {forces, weaknesses, neutral}, 'attaque');
  });
}

function defenseSingleMode(root){
  clearAndFocus(root);
  root.appendChild(make('Mode Défense (1 type) — Choisissez un Type Défenseur'));
  createTypeGrid(root, (type) => {
    const forces = [], weaknesses = [], neutral = []; 
    TYPES.forEach(att => {
      const m = getMultiplier(att, type);
      if(m === 2) forces.push({type:att, mult:'x2'}); 
      else if(m === 0.5) weaknesses.push({type:att, mult:'x0.5'}); 
      else if(m === 0) neutral.push({type:att, mult:'x0'}); 
      
    });
    showResults(root, {forces, weaknesses, neutral}, 'defense-single');
  });
}

function defenseDoubleMode(root){
  clearAndFocus(root);
  root.appendChild(make('Mode Défense (2 types) — Choisissez le premier type'));
  createTypeGrid(root, (first) => {
    clearAndFocus(root);
    const info = document.createElement('div'); 
    info.className='center';
    info.innerHTML = `<h2>Choisissez le deuxième type (1er: ${first})</h2>`;
    root.appendChild(info);

    createTypeGrid(root, (second) => {
      const forces = [], weaknesses = [], neutral = [];
      TYPES.forEach(att => {
        const m1 = getMultiplier(att, first);
        const m2 = getMultiplier(att, second);
        const mult = +(m1 * m2); 

        if(mult === 4 || mult === 2) {
          forces.push({type:att, mult: mult === 4 ? 'x4' : 'x2'});
        } else if(mult === 0.5 || mult === 0.25) {
          weaknesses.push({type:att, mult: mult === 0.5 ? 'x0.5' : 'x0.25'});
        } else if(mult === 0) {
          neutral.push({type:att, mult:'x0'}); 
        }
      });
      showResults(root, {forces, weaknesses, neutral}, 'defense-double');
    });

    const gridCells = document.querySelectorAll('.type-grid .type-cell');
    gridCells.forEach(cell => {
      if(cell.dataset.type === first){
        cell.classList.add('type-selected');
        cell.removeEventListener('click', cell.onclick);
      }
    });
  });
}

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

  attackMode(app);
});
function addBackButton() {
    const btn = document.createElement("button");
    btn.id = "backButton";
    btn.textContent = "Retour";

    btn.style.display = "block";
    btn.style.margin = "40px auto";
    btn.style.padding = "12px 20px";
    btn.style.background = "#777777ff";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "16px";

    btn.addEventListener("click", () => {
        const app = document.getElementById('app');
        app.innerHTML = ''; 
        attackMode(app);     
    });

    document.querySelector("main.container").appendChild(btn);
}

window.addEventListener("DOMContentLoaded", addBackButton);
