import { defineConfig, mergeConfig } from 'vitest/config'
import { sharedConfig } from './vitest.shared.ts'

// Repo-specific overrides go here. Shared defaults come from strutvane-tooling.
export default mergeConfig(sharedConfig, defineConfig({}))
