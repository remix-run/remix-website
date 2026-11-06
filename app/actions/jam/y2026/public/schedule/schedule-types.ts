export type ScheduleItem = {
  time: string;
  title: string;
  description: string;
  emoji?: string;
  imgSrc?: string;
  speakers: {
    name: string;
    imgSrc?: string;
    bio?: string;
  }[];
};
