import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { algorithms } from "./data/DataFrontApp";

export default function App() {
  const handleClick = (href) => {
    console.log("Navegar a:", href);
    window.location.href = href;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 1rem",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 3rem auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "1rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          AlgoVisual
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "rgba(255,255,255,0.9)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Visualiza y aprende algoritmos avanzados de forma interactiva
        </p>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            Selecciona un algoritmo
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Haz clic en cualquier card para comenzar la visualización
          </p>
        </div>

        {/* Algorithm Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <div
                key={algo.id}
                onClick={() => handleClick(algo.href)}
                style={{ cursor: "pointer" }}
              >
                <Card
                  style={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    transform: "translateY(0)",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    border: "none",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.1)";
                  }}
                >
                  <CardHeader style={{ padding: "1.5rem 1.5rem 1rem 1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "16px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: algo.color,
                        }}
                      >
                        <Icon
                          style={{
                            width: "32px",
                            height: "32px",
                            color: "white",
                            strokeWidth: 2,
                          }}
                        />
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "#4f46e5",
                          border: "none",
                          fontWeight: "600",
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          borderRadius: "9999px",
                        }}
                      >
                        {algo.category}
                      </Badge>
                    </div>
                    <CardTitle
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        marginBottom: "0.5rem",
                        lineHeight: "1.3",
                      }}
                    >
                      {algo.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
                    <CardDescription
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                        color: "#666",
                      }}
                    >
                      {algo.description}
                    </CardDescription>

                    {/* Arrow indicator */}
                    <div
                      style={{
                        marginTop: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        color: "#667eea",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span>Explorar</span>
                      <svg
                        style={{
                          width: "20px",
                          height: "20px",
                          marginLeft: "0.5rem",
                          transition: "transform 0.3s ease",
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
