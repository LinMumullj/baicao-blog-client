import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AvatarUploadForm } from "@/components/avatar-upload-form";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </Button>
      <AvatarUploadForm />
    </div>
  );
}
