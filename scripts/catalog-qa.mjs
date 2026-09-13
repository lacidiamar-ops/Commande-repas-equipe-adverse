import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
for (const [index, source] of scripts.entries()) new vm.Script(source, { filename:`inline-${index}.js` });

const prefix = scripts[0].split("/* ============================================================\n   ESPACE ADMINISTRATEUR")[0];
const context = vm.createContext({ console, Intl, Date, URL, TextEncoder, setTimeout, clearTimeout, LOGO_BLANC:"", LOGO_COULEUR:"" });
new vm.Script(prefix, { filename:"catalog-runtime.js" }).runInContext(context);
const runtime = JSON.parse(new vm.Script(`JSON.stringify((() => {
  const flat = flattenCatalog(CATALOG);
  const cart = { "pz-royale-bresaola-tomate":2, "pz-royale-bresaola-blanche":1, "su-yume-nigiri-saumon":3 };
  const summary = computeSummary(cart,CATALOG,LOGISTICS,TAX,{});
  const baseOrder = { devisNumber:"D-QA", devisCreatedAt:"2026-09-13T12:00:00Z", club:"QA Club", name:"Test User", email:"qa@example.test", headcount:30, deliveryTime:"20:00", serviceTime:"22:45", deliveryPlace:"Vestiaire", acceptedTerms:false };
  const match = Object.assign({},MATCH,{ isoDate:"2026-09-20", orderDeadlineISO:"2026-09-13" });
  return {
    drinks:CATALOG.boissons.groups.map(group => ({ name:trText(group.name,"fr"), ids:group.items.map(item => item.id) })),
    sushi:CATALOG.sushi.groups[0].items.map(item => ({ id:item.id, price:item.price, en:trText(item.name,"en") })),
    pizzas:{
      margherita:flat["pz-margherita"],
      half:trText(flat["pz-moitie"].desc,"en"),
      dimeco:trText(flat["pz-dimeco"].desc,"fr"),
      royaleTomato:flat["pz-royale-bresaola-tomate"],
      royaleWhite:flat["pz-royale-bresaola-blanche"]
    },
    quotes:Object.fromEntries(["fr","en","es","it"].map(language => {
      const order = Object.assign({},baseOrder,{language});
      return [language,{ html:buildDevisHTML(summary,order,match,ISSUER,LOGISTICS,TAX,POWER_NOTE,"",""), text:buildDevisText(summary,order,match,ISSUER,LOGISTICS,TAX) }];
    }))
  };
})())`).runInContext(context));

const assertions = [
  ["A4 portrait customer slot", /\.fam-affiche img\{[^}]*aspect-ratio:210\/297;[^}]*object-fit:contain/s],
  ["A4 portrait admin preview", /\.adm-visuel-preview\{[^}]*aspect-ratio:210\/297;[^}]*object-fit:contain/s],
  ["Margherita 14.90", /id:"pz-margherita"[\s\S]{0,500}price:14\.90/],
  ["Royale tomato variant", /id:"pz-royale-bresaola-tomate"/],
  ["Royale white variant", /id:"pz-royale-bresaola-blanche"/],
  ["seven sushi references", (html.match(/"su-yume-[a-z-]+":\[/g) || []).length === 7],
  ["sushi single price", /price:1\.65, unit:"pièce"/],
  ["drink families", /BOISSONS_PAR_FAMILLE_REF[\s\S]*Bières[\s\S]*Boissons gazeuses · Coca-Cola[\s\S]*Eaux[\s\S]*Jus & smoothies[\s\S]*Yaourts à boire/],
  ["delete request UI", /admin_access_request_delete/],
  ["multilingual quote", /const DEVIS_I18N = \{[\s\S]*fr:\{[\s\S]*en:\{[\s\S]*es:\{[\s\S]*it:\{/],
  ["order language persistence", /language:currentLang/],
  ["startup scroll top", /history\.scrollRestoration = "manual"[\s\S]*remonterEnHautAuDemarrage/],
  ["service worker version aligned", html.includes("./sw.js?v=43") && sw.includes('VERSION = "43"')]
  ,["drink family order at runtime", JSON.stringify(runtime.drinks.map(group => group.name)) === JSON.stringify(["Bières","Boissons gazeuses · Coca-Cola","Eaux","Jus & smoothies","Yaourts à boire"])]
  ,["no duplicate Plein Fruit at runtime", runtime.drinks.flatMap(group => group.ids).filter(id => id === "bv-plein-fruit-pomme-bio").length === 1]
  ,["Pom'Potes removed from drinks", !runtime.drinks.flatMap(group => group.ids).includes("bv-pompotes-pomme")]
  ,["seven sushi at runtime", runtime.sushi.length === 7 && runtime.sushi.every(item => item.price === 1.65 && item.en)]
  ,["pizza bases corrected", runtime.pizzas.half.includes("Tomato base on both halves") && runtime.pizzas.dimeco.startsWith("Base tomate")]
  ,["Royale split quantities", runtime.pizzas.royaleTomato.cardGroup === "pz-royale-bresaola" && runtime.pizzas.royaleWhite.cardGroup === "pz-royale-bresaola"]
  ,["quote languages render", runtime.quotes.en.html.includes("QUOTE") && runtime.quotes.es.html.includes("PRESUPUESTO") && runtime.quotes.it.html.includes("PREVENTIVO")]
  ,["quote translations preserved", runtime.quotes.en.html.includes("Salmon nigiri") && runtime.quotes.es.text.includes("Nigiri de salmón") && !JSON.stringify(runtime.quotes).includes("[object Object]")]
  ,["fallback archive translated", /construireVueArchiveSecours[\s\S]*d\("approved"\)[\s\S]*d\("fullName"\)[\s\S]*formatDateHeureLang/]
  ,["access code normalized", /ouvrirAccesEquipe\(\)[\s\S]*toUpperCase\(\)[\s\S]*replace\(\/\[–—−\]\/g, "-"\)[\s\S]*replace\(\/\\s\+\/g, ""\)/]
];

const failures = assertions.filter(([,test]) => typeof test === "boolean" ? !test : !test.test(html));
if (failures.length){
  for (const [label] of failures) console.error(`FAIL ${label}`);
  process.exitCode = 1;
} else {
  console.log(`PASS ${assertions.length} catalogue and workflow checks`);
}
