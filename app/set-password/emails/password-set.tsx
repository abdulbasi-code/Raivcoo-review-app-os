// emails/password-set.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Link,
} from "@react-email/components";

interface PasswordSetEmailProps {
  email: string;
}

export default function PasswordSetEmail({ email }: PasswordSetEmailProps) {
  const previewText =
    "Your password has been successfully set for your test account";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: "#f6f9fc",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "20px",
            borderRadius: "5px",
            maxWidth: "600px",
          }}
        >
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Heading as="h1">Password Set Successfully</Heading>
          </Section>

          <Section style={{ marginBottom: "32px" }}>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#333333" }}
            >
              Hello,
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#333333" }}
            >
              We're writing to confirm that a password has been successfully set
              for your test account ({email}).
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#333333" }}
            >
              You can now log in using your email address and the password you
              just created.
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Button
              href="https://test.com/login"
              style={{
                backgroundColor: "#8B5CF6",
                borderRadius: "5px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
                textDecoration: "none",
                textAlign: "center",
                display: "block",
                width: "100%",
                padding: "12px",
              }}
            >
              Log In to Your Account
            </Button>
          </Section>

          <Section
            style={{
              borderTop: "1px solid #e6ebf1",
              marginTop: "32px",
              paddingTop: "32px",
            }}
          >
            <Text
              style={{ fontSize: "14px", lineHeight: "24px", color: "#8898aa" }}
            >
              If you did not request this password setup, please contact our
              support team immediately at support@test.com.
            </Text>
            <Text
              style={{ fontSize: "14px", lineHeight: "24px", color: "#8898aa" }}
            >
              For security, this request was received from the test website.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
