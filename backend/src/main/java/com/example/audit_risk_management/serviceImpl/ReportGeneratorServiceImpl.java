package com.example.audit_risk_management.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.model.Report;
import com.example.audit_risk_management.service.ReportGeneratorService;


@Service
public class ReportGeneratorServiceImpl 
        implements ReportGeneratorService {



    private final String uploadPath =
            "reports/";



    // ================= PDF GENERATION =================


    @Override
    public Resource generatePdfReport(
            Report report) {


        try {


            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();



            PDDocument document =
                    new PDDocument();



            PDPage page =
                    new PDPage();



            document.addPage(page);



            PDPageContentStream content =
                    new PDPageContentStream(
                            document,
                            page);



            content.setFont(
                    new PDType1Font(Standard14Fonts.FontName.HELVETICA),
                    14);



            content.beginText();

            content.newLineAtOffset(
                    50,
                    700);



            content.showText(
                    "Audit Risk Management Report");


            content.newLineAtOffset(
                    0,
                    -30);



            content.setFont(
                    new PDType1Font(Standard14Fonts.FontName.HELVETICA),
                    11);



            content.showText(
                    "Report ID : "
                    + report.getReportId());


            content.newLineAtOffset(
                    0,
                    -20);



            content.showText(
                    "Title : "
                    + report.getReportTitle());


            content.newLineAtOffset(
                    0,
                    -20);



            content.showText(
                    "Type : "
                    + report.getReportType());



            content.newLineAtOffset(
                    0,
                    -20);



            content.showText(
                    "Status : "
                    + report.getStatus());



            if(report.getRisk()!=null){

                content.newLineAtOffset(
                        0,
                        -20);


                content.showText(
                        "Risk : "
                        + report.getRisk()
                        .getTitle());
            }



            if(report.getKri()!=null){

                content.newLineAtOffset(
                        0,
                        -20);


                content.showText(
                        "KRI : "
                        + report.getKri()
                        .getKriName());
            }



            if(report.getMitigation()!=null){

                content.newLineAtOffset(
                        0,
                        -20);


                content.showText(
                        "Mitigation : "
                        + report.getMitigation()
                        .getMitigationTitle());
            }



            content.endText();

            content.close();



            document.save(output);

            document.close();



            return new ByteArrayResource(
                    output.toByteArray());



        }
        catch(Exception e){

            throw new RuntimeException(
                    "PDF generation failed",
                    e);
        }
    }





    // ================= WORD GENERATION =================


    @Override
    public Resource generateWordReport(
            Report report) {


        try {


            XWPFDocument document =
                    new XWPFDocument();



            XWPFParagraph paragraph =
                    document.createParagraph();



            paragraph.createRun()
                    .setText(
                    "Audit Risk Management Report");



            document.createParagraph()
                    .createRun()
                    .setText(
                    "Report ID : "
                    + report.getReportId());



            document.createParagraph()
                    .createRun()
                    .setText(
                    "Title : "
                    + report.getReportTitle());



            document.createParagraph()
                    .createRun()
                    .setText(
                    "Type : "
                    + report.getReportType());



            document.createParagraph()
                    .createRun()
                    .setText(
                    "Status : "
                    + report.getStatus());



            if(report.getRisk()!=null){

                document.createParagraph()
                .createRun()
                .setText(
                "Risk : "
                + report.getRisk().getTitle());

            }



            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();



            document.write(output);

            document.close();



            return new ByteArrayResource(
                    output.toByteArray());

        }
        catch(IOException e){

            throw new RuntimeException(
                    "Word generation failed",
                    e);
        }

    }





    // ================= SAVE PDF =================


    @Override
    public String savePdfFile(
            Report report) {


        try {


            File folder =
                    new File(uploadPath);


            if(!folder.exists())
                folder.mkdirs();



            String fileName =
                    report.getReportId()
                    + ".pdf";



            File file =
                    new File(
                    uploadPath + fileName);



            Resource resource =
                    generatePdfReport(report);



            FileOutputStream fos =
                    new FileOutputStream(file);



            fos.write(
                    resource.getContentAsByteArray());



            fos.close();



            return file.getPath();


        }
        catch(Exception e){

            throw new RuntimeException(
                    "PDF save failed",
                    e);
        }

    }





    // ================= SAVE WORD =================


    @Override
    public String saveWordFile(
            Report report) {


        try {


            File folder =
                    new File(uploadPath);


            if(!folder.exists())
                folder.mkdirs();



            String fileName =
                    report.getReportId()
                    + ".docx";



            File file =
                    new File(
                    uploadPath + fileName);



            Resource resource =
                    generateWordReport(report);



            FileOutputStream fos =
                    new FileOutputStream(file);



            fos.write(
            resource.getContentAsByteArray());



            fos.close();



            return file.getPath();


        }
        catch(Exception e){

            throw new RuntimeException(
                    "Word save failed",
                    e);
        }

    }

}