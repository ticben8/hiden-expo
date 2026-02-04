
import { Narrative, Exhibition } from './types';

export const DEFAULT_NARRATIVES: Narrative[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: [
    "صمت الأغصان", "عرق الجبين", "ذهبية العصر", "جذور لا تموت", 
    "طقوس الفجر", "مباركة الأرض", "رائحة المطر", "أيدي الحكماء",
    "ذاكرة الشجرة", "شمس الشتاء", "حبات الأمل", "تعب مبارك"
  ][i % 12],
  writer: ["ياسين الطرابلسي", "سارة بن سالم", "منصف القيرواني", "أنيسة الجندوبي", "كمال الرياحي"][i % 5],
  image: `https://picsum.photos/seed/olive-${i}/800/1000`,
  audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 5) + 1}.mp3`,
  description: `هذه السردية تستعرض تجليات الحصاد... ما لا تراه الأعين يراه القلب في لمعة الزيت.`,
  x: Math.cos((i / 12) * 2 * Math.PI) * 35 + 50,
  y: Math.sin((i / 12) * 2 * Math.PI) * 35 + 50,
}));

export const INITIAL_EXHIBITION: Exhibition = {
  id: 'ex-1',
  slug: 'zaitouna-bousid',
  context: {
    name: "قرية سيدي بوزيد",
    location: "الساحة الكبرى، تونس",
    story: "في قلب تونس، حيث تضرب جذور الزيتون عميقاً في التاريخ، اجتمع السكان ليوثقوا لحظات الحصاد بهواتفهم. هذه هي سردية الزيت."
  },
  items: DEFAULT_NARRATIVES,
  createdAt: Date.now()
};
