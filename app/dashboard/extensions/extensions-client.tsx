"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevButtons } from "@/components/ui/RevButtons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  ArrowRight,
  Download,
  AlertTriangle,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { EditorProfile } from "@/app/types/editorProfile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ExtensionsClientProps {
  hasPasswordAuth: boolean;
  email: string;
  profile: EditorProfile;
}

export default function ExtensionsClient({
  hasPasswordAuth,
  email,
  profile,
}: ExtensionsClientProps) {
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await fetch("/api/download-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionType: "TEST-all-adobe" }),
      });

      const link = document.createElement("a");
      link.href = "/download/TEST-extension.zxp";
      link.download = "TEST-extension.zxp";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadDialog(true);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen md:p-6 py-3 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
          TEST Extension
        </h1>
        <p className="text-muted-foreground">
          Bring TEST to your favorite Adobe Creative Cloud apps.
        </p>
      </div>

      {/* Extension Card */}
      <Card>
        <CardHeader>
          <CardTitle>Download Extension</CardTitle>
          <CardDescription>
            One extension that works across your video and design apps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Supported Adobe Apps</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Premiere Pro</li>
              <li>After Effects</li>
              <li>Adobe Animate</li>
              <li>Illustrator</li>
              <li>
                Photoshop{" "}
                {/* <span className="text-yellow-500">(limited support)</span> */}
              </li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <RevButtons
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading || !hasPasswordAuth}
              className="w-full"
            >
              {isDownloading ? (
                "Downloading..."
              ) : (
                <>
                  Download Extension
                  <Download className="ml-2 h-4 w-4" />
                </>
              )}
            </RevButtons>
          </div>

          {!hasPasswordAuth && (
            <p className="text-sm text-center text-orange-600">
              Please set a password first to use the extension.
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col space-y-4">
          <Alert variant="warning" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-">Login Required</AlertTitle>
            <AlertDescription>
              Use your TEST email and password to log into the extension.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>

      {/* Password Setup */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Secure Access
          </CardTitle>
          <CardDescription>
            Set up a password to log in inside Adobe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPasswordAuth ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-500">
                  ✓ Password already set
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can log in to the extension with your email: {email}
                </p>
              </div>
              <RevButtons asChild variant="outline" size="sm">
                <Link href="/set-password">
                  Change Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </RevButtons>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  ⚠ No password set
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set a password to activate extension login.
                </p>
              </div>
              <RevButtons asChild size="sm">
                <Link href="/set-password">
                  Set Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </RevButtons>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Guide</CardTitle>
          <CardDescription>
            Step-by-step instructions to install the extension.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Step 1: Download</h3>
            <p className="text-sm text-muted-foreground">
              Use the button above to download the .zxp file.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Step 2: Install with ZXP Installer</h3>
            <p className="text-sm text-muted-foreground">
              Download the free{" "}
              <a
                href="https://aescripts.com/learn/zxp-installer/"
                className="underline text-violet-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Aescripts ZXP Installer
              </a>{" "}
              and drag the file into the app.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Step 3: Launch the Extension</h3>
            <p className="text-sm text-muted-foreground">
              Open your Adobe app (e.g. Premiere Pro, After Effects, etc.) and
              go to:
              <br />
              <span className="font-medium">Window → Extensions</span> or{" "}
              <span className="font-medium">Window → Extensions (legacy)</span>,
              depending on your version.
              <br />
              If the extension doesn’t appear right away, try restarting the
              app.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Step 4: Login</h3>
            <p className="text-sm text-muted-foreground">
              Enter your TEST email and password to start reviewing projects.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Compatibility Alert */}
      <Alert>
        <Monitor className="h-4 w-4" />
        <AlertTitle>Platform Compatibility</AlertTitle>
        <AlertDescription>
          ✅ Fully tested on Windows 11. macOS support is in progress. Photoshop
          support is currently limited due to Adobe panel restrictions.
        </AlertDescription>
      </Alert>

      {/* Download Confirmation Dialog */}
      <Dialog open={downloadDialog} onOpenChange={setDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Started</DialogTitle>
            <DialogDescription>
              Your extension is being downloaded. You’ll find it in your
              Downloads folder.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RevButtons
              onClick={() => setDownloadDialog(false)}
              className="w-full"
            >
              Got it
            </RevButtons>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
