import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificateNumber = () => {
    return `CERT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const generateCertificatePDF = ({
    certificateNumber,
    participantName,
    eventTitle,
    eventDate,
    issuedOn
}) => {
    return new Promise((resolve, reject) => {
        try {
            const uploadDirectory = path.join(
                __dirname,
                "../uploads/certificates"
            );

            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, {
                    recursive: true
                });
            }

            const fileName = `${certificateNumber}.pdf`;

            const filePath = path.join(
                uploadDirectory,
                fileName
            );

            const doc = new PDFDocument({
                size: "A4",
                layout: "landscape",
                margin: 50
            });

            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            doc
                .fontSize(32)
                .font("Helvetica-Bold")
                .text(
                    "CERTIFICATE OF PARTICIPATION",
                    {
                        align: "center",
                        margin: 50
                    }
                );

            doc.moveDown(2);

            doc
                .fontSize(18)
                .font("Helvetica")
                .text(
                    "This certificate is proudly presented to",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1);

            doc
                .fontSize(30)
                .font("Helvetica-Bold")
                .text(
                    participantName,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1.5);

            doc
                .fontSize(18)
                .font("Helvetica")
                .text(
                    "for successfully participating in",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.8);

            doc
                .fontSize(24)
                .font("Helvetica-Bold")
                .text(
                    eventTitle,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1);

            doc
                .fontSize(15)
                .font("Helvetica")
                .text(
                    `Event Date: ${new Date(eventDate).toLocaleDateString()}`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            doc
                .fontSize(15)
                .text(
                    `Issued On: ${new Date(issuedOn).toLocaleDateString()}`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1);

            doc
                .fontSize(13)
                .text(
                    `Certificate Number: ${certificateNumber}`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(3);

            doc
                .fontSize(14)
                .text(
                    "EventSphere",
                    {
                        align: "center"
                    }
                );

            doc.end();

            stream.on("finish", () => {
                resolve({
                    fileName,
                    filePath
                });
            });

            stream.on("error", reject);

        } catch (error) {
            reject(error);
        }
    });
};