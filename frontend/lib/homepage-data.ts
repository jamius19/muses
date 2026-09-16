/*
 * Author: Jamius Siam
 * Since: 16/09/2026
 */

export interface HomepageStory {
  id: string
  title: string
  titleHref?: string
  source?: string
  sourceHref?: string
  points: number
  author: string
  authorHref: string
  age: string
  commentCount: number
  commentsHref: string
}

export interface HomepageData {
  weekday: string
  day: string
  month: string
  year: string
  stories: HomepageStory[]
}

export const homepageData: HomepageData = {
  weekday: "Wednesday",
  day: "16",
  month: "September",
  year: "2026",
  stories: [
    {
      id: "1",
      title: "Introducing System One Models and Jev",
      titleHref: "https://typesafe.ai",
      source: "typesafe.ai",
      sourceHref: "https://typesafe.ai",
      points: 1308,
      author: "abelfio",
      authorHref: "/user/abelfio",
      age: "13 hours ago",
      commentCount: 382,
      commentsHref: "/thread/1",
    },
    {
      id: "2",
      title: "Apple Reference Image: A New Approach for Verified Photography",
      points: 218,
      author: "irwally",
      authorHref: "/user/irwally",
      age: "6 hours ago",
      commentCount: 140,
      commentsHref: "/thread/2",
    },
    {
      id: "3",
      title: "Show HN: An e-ink frame that hears birds and draws them as 1800s illustrations",
      titleHref: "https://github.com/armegiacomo",
      source: "github.com/armegiacomo",
      sourceHref: "https://github.com/armegiacomo",
      points: 1604,
      author: "arnemunthekaas",
      authorHref: "/user/arnemunthekaas",
      age: "20 hours ago",
      commentCount: 202,
      commentsHref: "/thread/3",
    },
    {
      id: "4",
      title: "Show HN: I made a flight simulator, except you're just a passenger",
      titleHref: "https://inflightsimulator.com",
      source: "inflightsimulator.com",
      sourceHref: "https://inflightsimulator.com",
      points: 161,
      author: "rkotcher",
      authorHref: "/user/rkotcher",
      age: "5 hours ago",
      commentCount: 69,
      commentsHref: "/thread/4",
    },
    {
      id: "5",
      title: "An update on Wayback Machine access",
      titleHref: "https://blog.archive.org",
      source: "blog.archive.org",
      sourceHref: "https://blog.archive.org",
      points: 515,
      author: "ChrisArchitect",
      authorHref: "/user/chrisarchitect",
      age: "14 hours ago",
      commentCount: 264,
      commentsHref: "/thread/5",
    },
    {
      id: "6",
      title: "Negativland, Culture Jamming, and the Art of Making Something New",
      points: 75,
      author: "bananaboy",
      authorHref: "/user/bananaboy",
      age: "5 hours ago",
      commentCount: 19,
      commentsHref: "/thread/6",
    },
    {
      id: "7",
      title: "EU Floats Canada Becoming the Bloc's First 'Associate Member'",
      titleHref: "https://bloomberg.com",
      source: "bloomberg.com",
      sourceHref: "https://bloomberg.com",
      points: 27,
      author: "helsinkiandrew",
      authorHref: "/user/helsinkiandrew",
      age: "23 minutes ago",
      commentCount: 18,
      commentsHref: "/thread/7",
    },
    {
      id: "8",
      title: "Doing Everyone Else's Job",
      points: 47,
      author: "luu",
      authorHref: "/user/luu",
      age: "5 hours ago",
      commentCount: 22,
      commentsHref: "/thread/8",
    },
    {
      id: "9",
      title: "Gemini 3.8 Live and 3.8 Live Extended Thinking",
      titleHref: "https://blog.google",
      source: "blog.google",
      sourceHref: "https://blog.google",
      points: 395,
      author: "leumon",
      authorHref: "/user/leumon",
      age: "14 hours ago",
      commentCount: 260,
      commentsHref: "/thread/9",
    },
    {
      id: "10",
      title: "Building a Linux GPU Driver for the M4 Mac Mini in One Month",
      titleHref: "https://cody.dev",
      source: "Cody.dev",
      sourceHref: "https://cody.dev",
      points: 299,
      author: "ADeWithAndrea",
      authorHref: "/user/adewithandrea",
      age: "13 hours ago",
      commentCount: 172,
      commentsHref: "/thread/10",
    },
    {
      id: "11",
      title: "Datamimic – don't let your coding agent invent its own test world",
      points: 32,
      author: "ake21",
      authorHref: "/user/ake21",
      age: "3 hours ago",
      commentCount: 6,
      commentsHref: "/thread/11",
    },
    {
      id: "12",
      title: "Recreating Voodoo Graphics and a Late-1990s Gaming PC on an FPGA",
      points: 119,
      author: "zdw",
      authorHref: "/user/zdw",
      age: "9 hours ago",
      commentCount: 30,
      commentsHref: "/thread/12",
    },
    {
      id: "13",
      title: "German Rheinmetall open-sources its Battlesuite connected weapon system protocol",
      titleHref: "https://rheinmetall.github.io",
      source: "rheinmetall.github.io",
      sourceHref: "https://rheinmetall.github.io",
      points: 212,
      author: "summarity",
      authorHref: "/user/summarity",
      age: "11 hours ago",
      commentCount: 72,
      commentsHref: "/thread/13",
    },
    {
      id: "14",
      title: "Why I'm still bearish on LLMs after Navier-Stokes",
      points: 209,
      author: "jaykru",
      authorHref: "/user/jaykru",
      age: "11 hours ago",
      commentCount: 221,
      commentsHref: "/thread/14",
    },
    {
      id: "15",
      title: "A software thing I built: GPS on a 25MHz 486-SX",
      points: 17,
      author: "JPLerouzic",
      authorHref: "/user/jplerouzic",
      age: "2 hours ago",
      commentCount: 6,
      commentsHref: "/thread/15",
    },
  ],
}
