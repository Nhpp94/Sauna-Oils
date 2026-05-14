# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
expo start          # Start dev server (Expo Go or dev build)
expo run:ios        # Build and run on iOS simulator / device
expo run:android    # Build and run on Android
expo start --web    # Run in browser
npx tsc --noEmit    # Type-check (no test runner configured)
node scripts/export-data.js   # Regenerate remote-data JSON files from local data
```

No lint script is configured. TypeScript is the primary correctness check.

## Architecture

### Routing
Expo Router file-based routing. All screens live under `app/`. The root `app/_layout.tsx` wraps the entire tree in six nested context providers (order matters — `AuthProvider` outermost, `StudioProvider` innermost). Modal and full-screen-modal presentations are declared in `_layout.tsx`; adding a new route requires a `<Stack.Screen>` entry there.

Tab navigation is `app/(tabs)/` with five tabs: Home, Library, My Kit, Studio (the session tab is hidden from the bar and accessed programmatically).

### Data flow — oils, blends, incense
Static definitions live in `data/oils.ts`, `data/blends.ts`, `data/incense.ts`. These are the local fallback. `RemoteDataContext` fetches updated JSON from GitHub (`constants/remoteConfig.ts` has the URLs), caches to AsyncStorage, and exposes the merged result. Any change to catalog content should be made in `data/`, then `node scripts/export-data.js` regenerates `remote-data/*.json` for the live update path.

### Session generation
`hooks/useSession.ts` is the entry point. It calls into `data/recommendations.ts`, which contains the scoring and selection algorithm: oils are scored by vibe + time-of-day fit + note balance (top/middle/base), blends replace oils at ~35% probability, and incense is selected separately. The three rounds (opening / core / closing) have different note-weight profiles.

The result screen receives its data via the module-level `store/sessionStore.ts` (not React context) — `setSharedSession()` before navigating, `useSharedSession()` to read. This is intentional: the session result is a modal that can be reached from two different navigation stacks.

### Studio / multi-tenancy
`context/StudioContext.tsx` manages all studio state. A user can belong to multiple studios simultaneously. The context holds two slices:
- `studios: StudioEntry[]` — all memberships, pre-loaded with member lists, used by the card list in `app/(tabs)/studio.tsx`
- Active-studio slice (`studio`, `studioOils`, `studioSessions`, `members`, `isAdmin`) — hydrated by `setActiveStudioId(id)` when navigating into `app/studio/[id].tsx`

`manage.tsx` and `new-session.tsx` read from the active-studio slice, so `setActiveStudioId` must be called before pushing to those routes.

### Authentication & Supabase
`lib/supabase.ts` configures the Supabase client with a chunked secure-storage adapter (iOS has a token size limit; tokens are split into 2 kB chunks). `AuthContext` wraps auth state. Supabase RLS is the primary access-control layer; `supabase-fix-rls.sql` adds security-definer functions (`get_my_studio_ids`, `is_studio_admin`) to avoid infinite recursion in RLS policies.

### Design system
All visual constants are in `constants/theme.ts`: `Colors`, `Typography`, `FontSize`, `Spacing`, `Radius`. The palette is dark luxury — near-black brown backgrounds, gold/cream text. Always use these tokens; do not hardcode colors or font sizes. Category colors (citrus, floral, woody, etc.) are also defined there and used for accent bars and chips throughout.

### TypeScript
Strict mode. The only pre-existing error is in `app/session/result.tsx` (two implicit `any` parameters) — ignore it in type checks with `grep -v "session/result"`.
