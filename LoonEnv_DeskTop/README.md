<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/046a534e-df89-4f18-aba0-a86b129f247f

## Development Principles

This project should be developed with these standing rules:

1. Module first: split robot data, rendering logic, plugin UI, and shared utilities by responsibility instead of growing mixed files.
2. Easy to extend: new robots or panels should plug into shared configuration modules rather than duplicate hardcoded values.
3. Easy to maintain: prefer small reversible refactors, single-source-of-truth constants, and minimal coupling so updates do not break existing behavior.
4. Web and desktop compatible: core functionality and UI flows should be designed to work in both browser and desktop-hosted environments, avoiding unnecessary runtime-specific coupling.
5. Frontend/backend architecture: prefer a clear frontend/backend split, with frontend focused on presentation, interaction, and orchestration while heavier processing and durable service logic live behind backend boundaries.
6. Keep the frontend lightweight: avoid pushing complex, long-running, or high-maintenance logic into the client when it can be handled by backend or shared service layers; preserve responsiveness and interaction quality first.

When in doubt, extract stable data/configuration first and keep structural changes lightweight.

See also:
- [`docs/development-guidelines.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/docs/development-guidelines.md)
- [`docs/design-centric-architecture.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/docs/design-centric-architecture.md)
- [`docs/algorithm-design-workflow.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/docs/algorithm-design-workflow.md)
- [`docs/algorithm-library-management.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/docs/algorithm-library-management.md)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## One-Click Local Stack

To start the current frontend together with the local PerfOpt backend and open the browser automatically:

```bash
bash scripts/start_dev_stack.sh
```

The dev stack uses the repo-local backend snapshot under [`backend/perfopt_v0`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/backend/perfopt_v0), so frontend/backend behavior stays versioned with this project.

To stop both services:

```bash
bash scripts/stop_dev_stack.sh
```
