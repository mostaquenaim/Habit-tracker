import Image from "next/image";
import QuestTracker from "@/components/QuestTracker";

export default function Home() {
  return (
    <div className=''>
      <main className=''>
        <QuestTracker />
      </main>
    </div>
  );
}
