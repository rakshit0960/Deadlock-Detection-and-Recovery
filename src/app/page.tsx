"use client";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2Icon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
        <CardHeader className="items-center text-center">
          <Share2Icon className="h-12 w-12 mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">Deadlock & Resource Simulator</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Dive into the world of operating systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Experiment with process resource allocation, visualize dependencies, and understand deadlock detection and recovery algorithms in an interactive environment.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 pt-6">
          <Link href="/simulator" passHref>
            <Button size="lg" className="w-full max-w-xs">Start Simulation</Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            No login required. Just click and explore!
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
