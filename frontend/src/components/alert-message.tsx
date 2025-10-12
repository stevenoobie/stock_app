import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, XCircle } from "lucide-react";

type AlertType = "success" | "error" | "info";

interface Props {
  type: AlertType;
  title: string;
  message: string;
}

export function AlertMessage({ type, title, message }: Props) {
  let icon;
  let variant: "default" | "destructive" = "default";

  switch (type) {
    case "success":
      icon = (
        <div className="text-green-500">
          <CheckCircle />
        </div>
      );
      break;
    case "error":
      icon = <XCircle className="text-red-500" />;
      variant = "destructive";
      break;
    case "info":
      icon = (
        <div className="text-blue-500">
          <Info />
        </div>
      );
      break;
  }

  return (
    <Alert variant={variant} className="shadow-md">
      {icon}
      <div>
        <AlertTitle className="text-center">{title}</AlertTitle>
        <AlertDescription className="text-center">{message}</AlertDescription>
      </div>
    </Alert>
  );
}
