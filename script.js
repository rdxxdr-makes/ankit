"use strict";
const NAMES = ["Nova Esports","Apex Reign","Iron Wolves","Crimson Tide","Void Walkers","Neon Syndicate","Storm Breakers","Shadow Pact",
"Titan Forge","Ghost Protocol","Solar Flare","Frost Giants","Phantom Edge","Rogue Legion","Cyber Hawks","Dragon Gate",
"Omega Squad","Blaze Unit","Night Owls","Thunder Clan","Steel Vipers","Quantum Rift","Lunar Wolves","Red Comets",
"Arctic Fox","Venom Core","Echo Five","Pulse Gaming","Rift Raiders","Zero Hour","Mirage Crew","Last Stand"];

// Standard seeding: 1 meets the lowest seed, top seeds meet as late as possible.
function seedOrder(n){let o=[1];while(o.length<n){const l=o.length*2+1;o=o.flatMap(x=>[x,l-x]);}return o;}
const rating = s => 1800 - (s-1)*25;
const winProb = (a,b) => 1/(1+Math.pow(10,(b.r-a.r)/400));
const isPow2 = n => n>=2 && (n&(n-1))===0;
const $ = id => document.getElementById(id);

let G = null;

function newGame(n){
  if(!isPow2(n)) return;                       // game never allows incomplete brackets
  const teams = NAMES.slice(0,n).map((name,i)=>({name,seed:i+1,r:rating(i+1)}));
  G = {n, rounds:[seedOrder(n).map(s=>teams[s-1])], picks:[{}], results:[], score:0, champion:null};
  render();
}

function roundName(r){
  const left = G.rounds[r].length;
  return left===2?"Final":left===4?"Semifinals":left===8?"Quarterfinals":"Round of "+left;
}

function render(){
  const cur = G.rounds.length-1, el = $("bracket");
  el.innerHTML = "";
  G.rounds.forEach((teams,r)=>{
    const col = document.createElement("div"); col.className="round";
    col.innerHTML = `<h3>${roundName(r)}</h3>`;
    const done = r < G.results.length;
    for(let i=0;i<teams.length/2;i++){
      const m = document.createElement("div"); m.className="match";
      [0,1].forEach(side=>{
        const t = teams[2*i+side], b = document.createElement("button");
        b.className="team";
        b.innerHTML = `<span>${t.name}</span><small>#${t.seed}</small>`;
        const pick = G.picks[r][i];
        if(done){
          const w = G.results[r][i];
          b.disabled = true;
          if(side===w) b.classList.add("won"); else b.classList.add("lost");
          if(pick===side) b.classList.add(pick===w?"right":"wrong");
        } else if(!G.champion){
          if(pick===side) b.classList.add("picked");
          b.onclick = ()=>{G.picks[r][i]=side; render();};
        }
        m.appendChild(b);
      });
      col.appendChild(m);
    }
    el.appendChild(col);
  });
  if(G.champion){
    const c=document.createElement("div"); c.className="round";
    c.innerHTML=`<h3>Champion</h3><div class="champ">🏆 ${G.champion.name}<br><small>#${G.champion.seed} seed</small></div>`;
    el.appendChild(c);
  }
  const total = G.rounds[cur].length/2, picked = Object.keys(G.picks[cur]).length;
  $("lockBtn").disabled = G.champion || picked<total;
  $("score").textContent = G.score;
  $("status").textContent = G.champion
    ? "Tournament complete. Final score: "+G.score
    : `${roundName(cur)}: ${picked}/${total} matches picked. Every match must be picked to lock the round (worth ${Math.pow(2,cur)} pt each).`;
}

function lockRound(){
  const r = G.rounds.length-1, teams = G.rounds[r], res = [], next = [];
  for(let i=0;i<teams.length/2;i++){
    const a=teams[2*i], b=teams[2*i+1];
    const w = Math.random()<winProb(a,b)?0:1;
    res.push(w); next.push(teams[2*i+w]);
    if(G.picks[r][i]===w) G.score += Math.pow(2,r);
  }
  G.results.push(res);
  if(next.length===1){ G.champion = next[0]; }
  else { G.rounds.push(next); G.picks.push({}); }
  render();
}

// ---------- Incomplete bracket lab (equal-strength teams) ----------
function labSim(n, trials){
  let P=1; while(P<n) P*=2;
  const order = seedOrder(P), wins = new Array(n+1).fill(0);
  for(let t=0;t<trials;t++){
    let cur = order.map(s=>s<=n?s:0);          // 0 = empty slot (bye)
    while(cur.length>1){
      const nx=[];
      for(let i=0;i<cur.length;i+=2){
        const a=cur[i], b=cur[i+1];
        nx.push(!a?b:!b?a:(Math.random()<0.5?a:b));
      }
      cur=nx;
    }
    wins[cur[0]]++;
  }
  return {P, byes:P-n, wins};
}

function runLab(){
  const n = Math.max(3,Math.min(32,parseInt($("labN").value)||6)), T=20000;
  const {P,byes,wins} = labSim(n,T);
  $("labInfo").innerHTML = isPow2(n)
    ? `${n} teams pair up completely: no byes, every team needs ${Math.log2(n)} wins. Fair: each team gets ${(100/n).toFixed(2)}%.`
    : `${n} teams do not fill a ${P}-slot bracket, so <b>${byes} bye(s)</b> are handed out (to the top seeds). Fair share would be ${(100/n).toFixed(2)}% each.`;
  const bars=$("labBars"); bars.innerHTML="";
  const max=Math.max(...wins);
  for(let s=1;s<=n;s++){
    const pct=wins[s]/T*100, hasBye = s<=byes;
    bars.insertAdjacentHTML("beforeend",
      `<div class="bar"><span class="n">Seed ${s} ${hasBye?'<span class="tag">BYE</span>':''}</span>
       <div class="fill ${hasBye?'bye':''}" style="width:${wins[s]/max*60}%"></div><span class="pct">${pct.toFixed(1)}%</span></div>`);
  }
}

$("newBtn").onclick = ()=>newGame(parseInt($("size").value));
$("lockBtn").onclick = lockRound;
$("labBtn").onclick = runLab;
newGame(16); runLab();
