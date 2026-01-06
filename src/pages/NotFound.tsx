import React from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h1 className="text-4xl font-bold mb-2">404</h1>
    <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
    <Button asChild>
      <Link to="/">Go Home</Link>
    </Button>
  </div>
);

export default NotFound;
