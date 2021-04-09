export let TINT_MAPPING: Record<Status, any> = {
  passed: `#6bca27`,
  failed: `#eb4e49`,
  running: `#FFBE30`,
  pending: {dynamic: {light: `#37474F`, dark: `#DDD`}},
}
