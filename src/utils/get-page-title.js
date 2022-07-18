import defaultSettings from '@/settings'

const title = defaultSettings.title || 'dora'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
