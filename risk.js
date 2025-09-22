
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q) {
  return new Promise(res => rl.question(q, ans => res(ans.trim())));
}

(async function main() {
  const n = parseInt(await ask("Введіть кількість станів економіки (n): "), 10);
  const p = (await ask(`Введіть ${n} ймовірностей через пробіл: `)).split(/\s+/).map(Number);
  const A = (await ask(`Введіть ${n} значень NPV для проєкту A: `)).split(/\s+/).map(Number);
  const B = (await ask(`Введіть ${n} значень NPV для проєкту B: `)).split(/\s+/).map(Number);
  const C = (await ask(`Введіть ${n} значень NPV для проєкту C: `)).split(/\s+/).map(Number);
  rl.close();

  const mean = (x,p) => x.reduce((s,xi,i)=>s + xi*p[i], 0);
  const variance = (x,p,m) => x.reduce((s,xi,i)=>s + p[i]*(xi-m)**2, 0);
  const std = v => Math.sqrt(v);
  const cv = (s,m) => (m!==0 ? s/m : Infinity);
  const evalProj = (label,x,p) => {
    const M = mean(x,p), V = variance(x,p,M), S = std(V), CV = cv(S,M);
    return {label,M,V,S,CV};
  };

  const rows = [evalProj("A",A,p), evalProj("B",B,p), evalProj("C",C,p)];
  const f = v => Number.isFinite(v)? v.toFixed(6): String(v);

  console.log("\nРезультати:");
  console.log("Проєкт\tM\t\tV\t\tσ\t\tCV");
  rows.forEach(r => console.log(`${r.label}\t${f(r.M)}\t${f(r.V)}\t${f(r.S)}\t${f(r.CV)}`));

  function bestBy(key,cmp=(a,b)=>a-b){return rows.reduce((best,cur)=>!best||cmp(cur[key],best[key])<0?cur:best,null);}
  const byMean=bestBy("M",(a,b)=>b-a), byVar=bestBy("V"), byCV=bestBy("CV");

  console.log("\nВисновок:");
  console.log(`• Найбільша очікувана дохідність: проєкт ${byMean.label} (M=${f(byMean.M)})`);
  console.log(`• Найменший ризик за варіацією: проєкт ${byVar.label} (V=${f(byVar.V)})`);
  console.log(`• Найстабільніший відносно дохідності: проєкт ${byCV.label} (CV=${f(byCV.CV)})`);
})();
