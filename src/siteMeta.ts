const LOCKED_META = {
  title: 'password',
  favicon: '/favicon-locked.svg',
  appleTouchIcon: '/apple-touch-icon-locked.svg',
  themeColor: '#000000',
}

const UNLOCKED_META = {
  title: 'my nonchalant queen ♥',
  favicon: '/favicon.svg',
  appleTouchIcon: '/apple-touch-icon.svg',
  themeColor: '#e3f0ff',
}

function setLinkIcon(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
}

export function applySiteMeta(unlocked: boolean) {
  const meta = unlocked ? UNLOCKED_META : LOCKED_META

  document.title = meta.title
  setLinkIcon('icon', meta.favicon)
  setLinkIcon('apple-touch-icon', meta.appleTouchIcon)

  const theme = document.querySelector('meta[name="theme-color"]')
  theme?.setAttribute('content', meta.themeColor)
}
