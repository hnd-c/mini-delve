import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 -mt-16">
      <Hero />
    </div>
  );
}
