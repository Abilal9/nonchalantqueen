export type Playlist = {
  id: string
  title: string
  subtitle: string
  cover: string
  url: string
}

export const playlists: Playlist[] = [
  {
    id: 'thinking-of-vienna',
    title: 'Thinking of Vienna',
    subtitle: 'This one is for you',
    cover: '/music/you-are-rare.jpg',
    url: 'https://music.apple.com/sa/playlist/thinking-of-vienna/pl.u-WabZvdYSp143gb',
  },
  {
    id: 'songs-for-my-soul-mate',
    title: 'Songs for my soul, mate',
    subtitle: 'Playlist made solely for my mate',
    cover: '/music/thinking-of-vienna.jpg',
    url: 'https://music.apple.com/sa/playlist/songs-for-my-soul-mate/pl.u-oZylD1aIvr5E4z',
  },
]
