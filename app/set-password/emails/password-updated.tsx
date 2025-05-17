// emails/password-updated.tsx
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
} from "@react-email/components";

interface PasswordUpdatedEmailProps {
  email: string;
}

export default function PasswordUpdatedEmail({
  email,
}: PasswordUpdatedEmailProps) {
  const previewText = "Your test account password has been updated";

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
            <Heading as="h1">Password Updated</Heading>
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
              We're writing to confirm that the password for your test account (
              {email}) has been successfully updated.
            </Text>
            <Text
              style={{ fontSize: "16px", lineHeight: "24px", color: "#333333" }}
            >
              If you made this change, no further action is required.
            </Text>
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
              If you did not update your password, please contact our support
              team immediately at support@test.com or secure your account by
              resetting your password.
            </Text>
            <Text
              style={{ fontSize: "14px", lineHeight: "24px", color: "#8898aa" }}
            >
              For security, this request was received from the test website.
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              href="https://test.com/reset-password"
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
              Reset Your Password
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
