import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

export type CertificateData = {
  employeeName: string;
  trainingName: string;
  workloadHours: number | null;
  trainingDate: string;
  signedByName: string | null;
  signedByRole: string | null;
  certificateCode: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  brand: { fontSize: 12, color: "#737373", marginBottom: 24, letterSpacing: 2 },
  title: { fontSize: 28, marginBottom: 24, textAlign: "center" },
  body: { fontSize: 14, textAlign: "center", lineHeight: 1.6, marginBottom: 32, maxWidth: 480 },
  name: { fontSize: 20, fontWeight: 700 },
  training: { fontWeight: 700 },
  signature: { marginTop: 48, alignItems: "center" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#000", width: 220, marginBottom: 6 },
  signatureName: { fontSize: 12 },
  signatureRole: { fontSize: 10, color: "#737373" },
  code: { position: "absolute", bottom: 32, fontSize: 9, color: "#a3a3a3" },
});

function CertificateDocument({ data }: { data: CertificateData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.brand}>SR. RH</Text>
        <Text style={styles.title}>Certificado de Participação</Text>
        <View style={styles.body}>
          <Text>
            Certificamos que <Text style={styles.name}>{data.employeeName}</Text> participou do
            treinamento <Text style={styles.training}>{data.trainingName}</Text>
            {data.workloadHours ? `, com carga horária de ${data.workloadHours} horas,` : ""} realizado
            em {data.trainingDate}.
          </Text>
        </View>

        {(data.signedByName || data.signedByRole) && (
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            {data.signedByName && <Text style={styles.signatureName}>{data.signedByName}</Text>}
            {data.signedByRole && <Text style={styles.signatureRole}>{data.signedByRole}</Text>}
          </View>
        )}

        <Text style={styles.code}>Código de validação: {data.certificateCode}</Text>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(data: CertificateData): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument data={data} />);
}
