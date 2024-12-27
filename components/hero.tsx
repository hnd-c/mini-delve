export default function Hero() {
  return (
    <div className="flex flex-col items-center gap-8 max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-bold text-center">
        Compliance Made Simple
      </h1>
      <p className="text-xl text-foreground/60 text-center max-w-2xl">
        Automate your regulatory compliance with Mini-Delve. Supporting HIPAA, 
        SOC 2, and more.
      </p>
    </div>
  );
}