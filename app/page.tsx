import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <h2>Hello There</h2>
      <Button>Heyy</Button>
      <UserButton/>
      
    </div>
    );
}
