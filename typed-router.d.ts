/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'vue-router'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    'auth': RouteRecordInfo<'auth', '/', Record<never, never>, Record<never, never>>,
    '/[...all]': RouteRecordInfo<'/[...all]', '/:all(.*)', { all: ParamValue<true> }, { all: ParamValue<false> }>,
    'admin': RouteRecordInfo<'admin', '/admin', Record<never, never>, Record<never, never>>,
    '/admin/': RouteRecordInfo<'/admin/', '/admin', Record<never, never>, Record<never, never>>,
    '/admin/game/[id]': RouteRecordInfo<'/admin/game/[id]', '/admin/game/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/': RouteRecordInfo<'/admin/game/[id]/', '/admin/game/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/bids': RouteRecordInfo<'/admin/game/[id]/bids', '/admin/game/:id/bids', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/game-progress': RouteRecordInfo<'/admin/game/[id]/game-progress', '/admin/game/:id/game-progress', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/presentation': RouteRecordInfo<'/admin/game/[id]/presentation', '/admin/game/:id/presentation', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/results': RouteRecordInfo<'/admin/game/[id]/results', '/admin/game/:id/results', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/survey': RouteRecordInfo<'/admin/game/[id]/survey', '/admin/game/:id/survey', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/admin/game/[id]/users': RouteRecordInfo<'/admin/game/[id]/users', '/admin/game/:id/users', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    'game': RouteRecordInfo<'game', '/game', Record<never, never>, Record<never, never>>,
  }
}
