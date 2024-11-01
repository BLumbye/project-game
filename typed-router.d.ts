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
    '/admin/bids': RouteRecordInfo<'/admin/bids', '/admin/bids', Record<never, never>, Record<never, never>>,
    '/admin/game-progress': RouteRecordInfo<'/admin/game-progress', '/admin/game-progress', Record<never, never>, Record<never, never>>,
    '/admin/results': RouteRecordInfo<'/admin/results', '/admin/results', Record<never, never>, Record<never, never>>,
    '/admin/survey': RouteRecordInfo<'/admin/survey', '/admin/survey', Record<never, never>, Record<never, never>>,
    '/admin/users': RouteRecordInfo<'/admin/users', '/admin/users', Record<never, never>, Record<never, never>>,
    'game': RouteRecordInfo<'game', '/game', Record<never, never>, Record<never, never>>,
  }
}
