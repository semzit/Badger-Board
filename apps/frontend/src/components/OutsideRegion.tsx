import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoards } from "@badger-board/lib/api";
import { Alert, AlertDescription } from "@badger-board/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@badger-board/components/ui/card";

function OutsideRegion() {
  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous || "auto";
    };
  }, []);

  return (
    <div
      className="p-sm-1 p-md-2 p-lg-3 p-xl-4 p-xxl-5"
      style={{
        minHeight: "100vh",
        background: "#c5050c",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1
          className="text-center mb-5"
          style={{
            color: "#dee2e6",
            fontWeight: "bold",
            fontSize: 50,
          }}
        >
          Outside Marked Region
        </h1>
        <p
          className="text-center"
          style={{
            color: "#dee2e6",
            fontSize: 20,
            marginBottom: "30px",
          }}
        >
          Enter a building recorded in our database to interact with its drawing board!
        </p>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "15px",
            padding: "20px",
            color: "#fff",
          }}
        >
          <CardHeader>
            <CardTitle className="mb-3">Available Boards:</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-white/50 italic">Checking database...</div>
            ) : error ? (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>Error: {error.message}</AlertDescription>
              </Alert>
            ) : boards && boards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {boards.map((board) => (
                  <span
                    key={board.name}
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      color: "#1a1a1a",
                      fontSize: "1rem",
                      padding: "10px 15px",
                      borderRadius: "9999px",
                      fontWeight: 500,
                    }}
                  >
                    {board.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-white/50">No boards registered yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OutsideRegion;
