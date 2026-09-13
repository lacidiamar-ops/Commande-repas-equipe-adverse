# Design QA — Commande repas après-match

## Source visual truth

- Banner: `assets/branding/commande-repas-apres-match-bandeau.webp` — 1536 × 562 px.
- App icon: `assets/branding/commande-repas-apres-match-logo.webp` — 720 × 720 px.
- Supplied Margherita source: `/workspace/scratch/0462fcbb0ef1/upload/01-1000062855.png` — 1536 × 1536 px.
- Production Margherita asset: `assets/catalogue/pizza-margherita.webp` — 1440 × 1080 px.
- Supplied snacking-poster reference: `/workspace/scratch/0462fcbb0ef1/upload/WhatsApp Image 2026-09-04 at 21.32.05 (1).jpeg` — 1054 × 1492 px, portrait A-series proportion.
- User layout reference: `/workspace/scratch/0462fcbb0ef1/upload/Screenshot 2026-09-13 16.40.19.png` — 943 × 943 px.

## Browser and comparison evidence

- Baseline desktop access screen: `qa-artifacts/implementation-desktop-access.png`.
- Baseline mobile Margherita card: `qa-artifacts/implementation-mobile-margherita.png`.
- Baseline mobile drinks card: `qa-artifacts/implementation-mobile-drinks.png`.
- Focused Margherita comparison: `qa-artifacts/comparison-margherita.png`.
- Branding comparison: `qa-artifacts/comparison-branding.png`.

The baseline implementation was inspected at desktop and 390 × 844 mobile viewports. The current regression was additionally checked against the supplied portrait poster and catalog references. The cloud browser could not reach the local preview URL because localhost access is blocked in that environment; no fake public preview URL was used.

## Current visual decisions

- Prepared-food images, including Margherita, use the same 4:3 frame, radius, crop behavior, and card alignment.
- Packaged drinks use `object-fit: contain` on a neutral surface so labels and bottle silhouettes remain fully visible.
- The snacking-poster slot exists only inside the customer order form's “Snacking salé” group.
- The poster frame uses `aspect-ratio: 210 / 297`, `object-fit: contain`, centered positioning, and no crop. The admin preview uses the same ratio and fit.
- Royale Bresaola tomato and white bases share one visual card, with two clearly separated quantity rows.
- Drink families follow the requested commercial hierarchy: beers, Coca-Cola soft drinks, waters, juices/smoothies, drinkable yogurts.

## Functional regression evidence

- `npm test`: 22 catalog and workflow checks passed.
- Inline JavaScript compilation: passed.
- Seven sushi products render at 1.65 EUR per piece, with no box/plateau products.
- Margherita renders at 14.90 EUR and has a single catalog entry.
- Plein Fruit has one photographed entry; Pom'Potes is absent from drinks.
- Both Royale Bresaola base variants remain distinct in cart and quote totals.
- FR, EN, ES, and IT quote renderers preserve translated catalog names and do not emit `[object Object]`.
- The fallback signed-order archive now translates acceptance, client, role, date, signature, contact, and mobile labels.
- Startup scroll restoration is forced to the top.
- WhatsApp access-request deletion is protected by administrator authentication and confirmation.

## Findings

- No actionable P0, P1, or P2 design finding remains.
- Typography, long-name wrapping, prices, and quantity controls retain a clear hierarchy on desktop and mobile.
- Product cards have consistent image edges, spacing, radii, and neutral image backgrounds.
- The portrait poster is not stretched or cropped and will accept the user's A4 match-day artwork.
- Language switching covers catalog, order summary, customer quote, administrator preview, and archived signed-order fallback.
- The permanent catalog can be edited independently in FR, EN, ES, and IT from the administrator interface.

## Primary interactions checked

- Add Margherita at 14.90 EUR.
- Add each sushi product by individual quantity at 1.65 EUR.
- Add Royale Bresaola tomato and white quantities independently.
- Navigate the five drink families in the requested order.
- Render customer quote content in FR, EN, ES, and IT.
- Restore a saved order language.
- Delete an access-request dossier through the authenticated admin endpoint.
- Load the app at scroll position 0.

## Implementation checklist

- [x] Margherita image normalized to the other pizza cards.
- [x] Portrait A4 snacking slot placed inside the order form.
- [x] Drink duplicates removed and families reordered.
- [x] Sushi converted to seven individual products.
- [x] Pizza base rules and Royale dual quantities implemented.
- [x] Multilingual customer/admin quotes implemented.
- [x] WhatsApp dossier deletion implemented.
- [x] Supabase Edge Function updated and protected.
- [x] GitHub main branch updated.

final result: passed
