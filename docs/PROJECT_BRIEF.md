# Projectbrief voor Codex: Dibs Crypto Portfolio React PWA

## Doel

Gebruik de bestaande GitHub-repository als starttemplate:

```text
https://github.com/jwamsterdam/dibs.git
```

Bouw hierop verder aan **Dibs**, een iPhone-first React PWA voor het bekijken van een cryptoportfolio per persoon. De app moet extreem rustig, Apple-achtig en privacyvriendelijk aanvoelen: geen account, geen backend, geen portfolio-data in URL's, en alleen informatie tonen die op dat moment nuttig is.

Gebruik de bijgevoegde visuele referentie `latest-ui-reference.svg` als richtinggevend screenshot. Let op: de originele ChatGPT-screenshotbijlage moet nog apart naar de Codex-taak of repository worden geüpload. Tot die tijd is `latest-ui-reference.svg` de gereconstrueerde referentie op basis van de laatste conversatie en UI-annotaties.

## Belangrijke werkwijze voor Codex

Start niet met een nieuw leeg project. Werk in de bestaande repo `jwamsterdam/dibs`.

De repository is al gevuld en gebruikt een enterprise React-template. Bekende basis:

- React 19;
- TypeScript;
- Vite 6;
- Tailwind CSS;
- TanStack Router;
- TanStack Query;
- Jotai;
- Jest/Testing Library;
- Cypress;
- Storybook;
- feature-based structuur onder `src/features`;
- gedeelde componenten/helpers onder `src/shared`;
- app bootstrap onder `src/app`.

De huidige repo-inhoud lijkt nog deels een generieke "configuration tool" blueprint. Gebruik de technische basis, tooling en architectuur, maar vervang de productinhoud door Dibs.

Aanpak:

1. Clone/open de repository `https://github.com/jwamsterdam/dibs.git`.
2. Inspecteer eerst de bestaande structuur, dependencies, styling en scripts.
3. Gebruik de bestaande template als basis en behoud de gekozen stack.
4. Voeg de screenshot/referentie toe aan de repo, bijvoorbeeld onder:

```text
docs/references/latest-ui-screenshot.png
```

of, zolang de originele screenshot ontbreekt:

```text
docs/references/latest-ui-reference.svg
```

5. Voeg eventueel deze projectbrief toe als:

```text
docs/PROJECT_BRIEF.md
```

6. Implementeer daarna de app iteratief volgens deze brief.
7. Run de bestaande checks/buildscripts uit de repo voordat je afrondt.

Verwijder of herschrijf generieke blueprint-copy zoals "Configuration Tool", "hardware configuration tool" en voorbeeldfeatures die niet bij Dibs horen. Doe dit zorgvuldig en behoud nuttige architectuurdocumentatie waar mogelijk, maar pas namen en context aan.

## Kernervaring

De gebruiker opent de PWA op iPhone en ziet direct:

- de actieve persoon, bijvoorbeeld `Jan`;
- tabs voor periodekeuze bovenaan: `1D`, `1W`, `1M`, `YTD`, `1Y`, `ALL`;
- een compacte lijst met `Totaal` en afzonderlijke assets;
- een subtiele blauwe verticale selectie-indicator naast de geselecteerde rij;
- een eenvoudige grafiek die altijd hoort bij de geselecteerde rij;
- onderaan alleen ETH staking rewards, als die relevant zijn.

De lijst is de navigatie. Er zijn geen chevrons/pijltjes achter coins, omdat er geen detailview achter elke rij zit. Tikken op een rij selecteert alleen de dataset voor de grafiek.

## Visuele Richting

Maak het ontwerp minimalistisch, wit, iOS/macOS-geïnspireerd:

- geen cards;
- geen schaduwen;
- geen decoratieve gradients;
- geen onnodige labels;
- veel gebruik van witruimte;
- bedragen rechts exact uitgelijnd;
- subtiele scheidingslijnen;
- geselecteerde rij met smalle blauwe balk links;
- grafieklijn in dezelfde blauwe accentkleur als de selectie.

De UI moet voelen als een kruising tussen Apple Stocks, Apple Wallet en macOS Finder.

## Laatste UI-feedback die verwerkt moet worden

1. Verwijder dubbele informatie bij de onderste regel rond de grafiek/rewards.
2. Verwijder de extra verandering/waarde onderin als die al in de rij of grafiekcontext zichtbaar is.
3. Maak grafieklijnen en verbindingslijnen subtieler.
4. Maak de visuele scheiding tussen tabs, totaalrij en afzonderlijke coins duidelijker.
5. Maak de regelafstand in de assetlijst compacter.
6. Lijn de grafiek en rewards onderaan rustig uit; laat witruimte tussen assetlijst en grafiek flexibel rekken.
7. Verwijder alle pijltjes/chevrons achter coins.
8. `ETH (0x02)` mag in de hoofdlijst `ETH staking` heten; technische 0x02-details horen een niveau dieper of in configuratie.
9. Toon per rij óf absolute verandering óf procentuele verandering, niet allebei tegelijk.
10. Default is absolute verandering. Tikken op de verandering wisselt naar procentueel.

## Informatiearchitectuur

### Hoofdscherm

Voorbeeldstructuur:

```text
Jan

1D   1W   1M   YTD   1Y   ALL

▌ Totaal        €352.946   +€4.218
  BTC            €26.896   +€1.125
  ETH            €14.712    -€382
  USDC           €12.500      €0
  ETH staking   €261.487   +€3.475

Totaal

[grafiek geselecteerde dataset]

ETH staking rewards        €18.420
```

### Interactie

- Tik op `Totaal`, `BTC`, `ETH`, `USDC` of `ETH staking` om de grafiek te wisselen.
- De geselecteerde rij krijgt een subtiele blauwe balk links.
- De grafiektitel neemt de geselecteerde rij over.
- De grafieklijn gebruikt dezelfde blauwe kleur.
- Periode-tabs beïnvloeden zowel de grafiek als de verandering achter elke rij.
- Tik op een verandering, bijvoorbeeld `+€4.218`, om te wisselen tussen absoluut en procentueel.
- Onthoud de laatst geselecteerde asset per persoon.
- Swipen tussen personen moet later mogelijk zijn; de actieve selectie per persoon blijft bewaard.

## Data en Privacy

Gebruik geen GET-parameters voor portfolio-data. Geen URLs zoals:

```text
?btc=0.42&eth=12.4&usdc=15000
```

Dat is onveilig, omdat zulke data kan lekken via browsergeschiedenis, bookmarks, screenshots, referer headers, sync en serverlogs.

Gebruik lokaal:

- IndexedDB voor portfolio-configuratie;
- optioneel `localStorage` alleen voor kleine UI-voorkeuren;
- Web Crypto API voor secure mode.

Aanbevolen model:

```json
{
  "people": [
    {
      "id": "jan",
      "name": "Jan",
      "selectedAssetId": "total",
      "assets": [
        { "id": "btc", "label": "BTC", "symbol": "BTC", "amount": 0.42 },
        { "id": "eth", "label": "ETH", "symbol": "ETH", "amount": 12.4 },
        { "id": "usdc", "label": "USDC", "symbol": "USDC", "amount": 12500 },
        {
          "id": "eth-staking",
          "label": "ETH staking",
          "symbol": "ETH",
          "amount": 86.21,
          "staking": {
            "type": "ethereum-0x02",
            "availableRewardsEth": 6.01
          }
        }
      ]
    }
  ]
}
```

## Secure Mode

Maak bij voorkeur twee opslagmodi:

- standaardmodus: IndexedDB, lokaal, niet versleuteld;
- secure mode: één versleuteld JSON-document in IndexedDB.

Secure mode:

- pincode bij openen;
- PBKDF2 voor key derivation;
- AES-GCM voor encryptie;
- geen pincode of sleutel opslaan;
- export/import van versleuteld backupbestand mogelijk maken in een latere fase.

## Prijzen en Datafeeds

Voor MVP:

- gebruik mockdata voor portfolio en historische grafiek;
- bouw de data-laag zo dat CoinGecko later eenvoudig kan worden aangesloten;
- voorkom dat UI afhankelijk wordt van één specifieke API-shape.

Later:

- CoinGecko voor spotprijzen en historische prijzen;
- Beacon API voor Ethereum 0x02 validator/rewards-data;
- fallback bij netwerkfouten: laatst bekende lokale waarden tonen.

## Technische Voorkeur

Gebruik de bestaande template-keuzes:

- React 19;
- TypeScript;
- Vite 6;
- Tailwind CSS;
- TanStack Router;
- TanStack Query waar later externe datafeeds nodig zijn;
- Jotai voor lokale UI/app-state;
- Jest/Testing Library voor componenttests;
- Storybook voor componentontwikkeling als dat al aanwezig is;
- PWA setup met manifest en service worker;
- IndexedDB via een kleine wrapper of Dexie;
- Recharts of een lichte custom SVG chart voor de grafiek;
- iPhone-first responsive layout.

Let op: de repo bevat mogelijk bestaande voorbeeldfeatures zoals `dashboard` en `zones`. Hergebruik de structuur, maar zet Dibs-functionaliteit bij voorkeur in een eigen feature slice, bijvoorbeeld:

```text
src/features/portfolio/
```

Mogelijke structuur:

```text
src/features/portfolio/
├── components/
├── hooks/
├── pages/
├── store/
├── types/
├── validation/
└── index.ts
```

## Layout Eisen

Optimaliseer primair voor iPhone:

- viewport rond 390 x 844 als basis;
- respecteer safe areas;
- geen horizontale scroll;
- touch targets minimaal 44 px waar interactief;
- assetrijen compact maar goed tikbaar;
- tekst en bedragen mogen nooit overlappen;
- waardenkolom rechts moet rustig en exact uitgelijnd zijn.

Gebruik geen landing page. Het hoofdscherm is direct de app.

## Animatie

Voeg subtiele animaties toe:

- selectie-indicator schuift naar de nieuwe rij;
- bedragen tellen vloeiend naar nieuwe waarde;
- grafiek morpht of fade/slide subtiel tussen datasets;
- duur ongeveer 200-300 ms;
- respecteer `prefers-reduced-motion`.

## MVP Scope

Lever eerst:

1. werkende PWA-shell binnen de bestaande `jwamsterdam/dibs` template;
2. hoofdscherm volgens referentie;
3. persoonnaam bovenaan;
4. periode-tabs;
5. assetlijst inclusief `Totaal`;
6. selectie per asset;
7. grafiek gekoppeld aan selectie;
8. absolute/procentuele toggle per verandering;
9. ETH staking rewards onderaan;
10. lokale mockdata;
11. IndexedDB opslagstructuur voorbereid.

## Repo-taken

Voer in de bestaande repository minimaal dit uit:

1. Voeg de UI-referentie toe aan `docs/references/`.
2. Voeg of update `docs/PROJECT_BRIEF.md`.
3. Update README/productnaam van generieke configuration-tool blueprint naar Dibs.
4. Controleer `package.json` en gebruik de bestaande scripts.
5. Overweeg `package.json` metadata te hernoemen van generiek/template naar Dibs, zonder tooling te breken.
6. Implementeer het hoofdscherm in de bestaande app-structuur.
7. Voeg waar logisch componenten toe voor:
   - periode-tabs;
   - assetlijst;
   - assetrij;
   - grafiek;
   - rewardsregel;
   - lokale data/opslag.
8. Houd styling iPhone-first.
9. Draai build/test/lint als beschikbaar.

## Niet Doen in MVP

- Geen account/login.
- Geen backend.
- Geen walletconnect.
- Geen trading.
- Geen portfolio-data in query parameters.
- Geen detailpagina per coin.
- Geen drukke dashboards met cards.
- Geen nieuwsfeed.
- Geen onnodige technische termen in de hoofdinterface.

## Acceptatiecriteria

- De app opent als PWA-achtige iPhone interface.
- `Totaal` is een selecteerbare rij, net als coins.
- Er staan nergens chevrons achter assetrijen.
- De geselecteerde rij en grafiek zijn visueel duidelijk gekoppeld.
- Periodetabs beïnvloeden grafiek en rijveranderingen.
- Per rij wordt maximaal één verandering getoond: absoluut of procentueel.
- De onderste dubbele waarderegels zijn verwijderd.
- ETH staking rewards staan onderaan als één rustige rechts uitgelijnde regel.
- Portfolio-data wordt lokaal opgeslagen en niet in de URL gezet.
- De UI blijft leesbaar en professioneel op mobiel.
