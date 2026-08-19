import { useNavigate } from "react-router";
import { Alert, AlertDescription } from "@badger-board/components/ui/alert";
import { Button } from "@badger-board/components/ui/button";
import { Card } from "@badger-board/components/ui/card";
import { useAdminBoards } from "./useAdminBoards";
import { AddBuildingForm } from "./AddBuildingForm";
import { RemoveBuildingForm } from "./RemoveBuildingForm";

export function AdminPage() {
  const navigate = useNavigate();
  const admin = useAdminBoards();

  return (
    <div style={{ minHeight: "100vh", background: "#c5050c", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 2001,
            background: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Home
        </Button>

        <Card
          style={{ background: "rgba(255,255,255,0.95)", padding: "40px", borderRadius: "20px" }}
        >
          <h2 className="text-center mb-4" style={{ color: "#c5050c", fontWeight: "bold" }}>
            Add/Remove A New Building
          </h2>
          <p className="text-center text-muted mb-4">
            Building corners not needed for remove operation
          </p>

          {admin.status && (
            <Alert
              variant={admin.status.type === "danger" ? "destructive" : "default"}
              className="mb-4"
            >
              <AlertDescription>{admin.status.message}</AlertDescription>
            </Alert>
          )}

          <AddBuildingForm {...admin} />
          <RemoveBuildingForm {...admin} />
        </Card>
      </div>
    </div>
  );
}
