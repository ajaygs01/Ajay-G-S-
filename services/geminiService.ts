
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeResume = async (
  text: string, 
  fileData?: { mimeType: string; data: string },
  socialLinks?: { github?: string; linkedin?: string }
): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key found.");
  }

  // Optimized System Instruction: Acts as a Scanner and Analyst
  const systemInstruction = "You are SkillChain's Verification Engine. You act as both a Forensic Analyst (detecting fakes) and a Digital Scanner (reading QR/IDs). Analyze documents for authenticity and cross-reference with provided social links.";

  const promptText = `
    Analyze the input document for AUTHENTICITY and CROSS-REFERENCE with social profiles.
    Input Type: ${fileData?.mimeType || 'Text'}
    
    Provided Social Links:
    - GitHub: ${socialLinks?.github || 'Not provided'}
    - LinkedIn: ${socialLinks?.linkedin || 'Not provided'}

    TASK: Determine if this certificate/resume is REAL or FAKE, and if it aligns with the provided social identity.

    1. **SCANNER MODE (High Priority)**:
       - **QR Codes / Barcodes**: Scan the visual image for QR codes or Barcodes. Their presence is a STRONG indicator of a verifiable, real certificate.
       - **Verification URLs/IDs**: Look for text like "Credential ID:", "Certificate No:", "Verify at...", or URLs.
       - **Digital Seals**: Look for official digital signatures or seals.
       - **Rule**: If a QR code, Barcode, or Credential ID/Link is found, the document is likely **AUTHENTIC**.

    2. **Visual Forgery Detection (Nuanced)**:
       - **Compression vs. Tampering**: Do NOT flag general blurriness, JPEG artifacts, or low resolution as forgery. Real certificates are often compressed.
       - **Localized Editing**: ONLY flag as fake if there is clear evidence of "patching" (a rectangle of different background color) specifically behind the Candidate Name or Date.
       - **Font Consistency**: Check if the Name font matches the rest of the document's design.

    3. **Content Logic**:
       - **Typos**: Official certificates rarely have typos in the Issuer's name (e.g., "Universty").
       - **Impossible Dates**: Dates in the future or invalid ranges.

    4. **Social Cross-Reference (Integrity Check)**:
       - Check if the Resume/Certificate explicitly mentions the provided GitHub/LinkedIn URLs.
       - Check if the candidate name in the document roughly matches the likely username/slug in the provided URLs.
       - Check if the skills claimed in the resume (e.g., "React Expert") are consistent with what one would expect on the provided GitHub (e.g., does the user have public repos implied?) or LinkedIn.
       - If URLs are provided but NOT found in the document, mark as 'Mismatch' or 'Not Verified'.

    5. **Decision Logic**:
       - **DEFAULT to TRUE (Authentic)** for professional-looking documents, templates, or scans, UNLESS there is specific, undeniable evidence of tampering.
       - **TRUE** if scanner elements (QR, ID, Link) are present.
       - **FALSE** only if there is obvious patching, mismatched fonts on the name, or logical impossibilities.

    6. **Extraction**:
       - If FAKE: Return empty certifications list.
       - If REAL: Extract Name, Certification Name, Issuer, Date, Credential ID, and a short description.

    Return JSON:
    - candidateName (string)
    - overallAuthenticityScore (number 0-100: <50 is Fake, >85 is Verified)
    - isDocumentAuthentic (boolean)
    - documentForgeryAnalysis (string)
    - socialIntegrity: {
        githubMatch: 'Verified' | 'Mismatch' | 'Not Provided',
        linkedinMatch: 'Verified' | 'Mismatch' | 'Not Provided',
        analysis: string
      }
    - summary (string)
    - skills: [{skillName, confidenceScore, status, reasoning}]
    - certifications: [{name, issuer, issueDate, credentialId, description}] (Leave empty if Fake)

    Input Text Context: "${text}"
  `;

  const parts: any[] = [];
  
  if (fileData) {
    parts.push({ 
      inlineData: { 
        mimeType: fileData.mimeType, 
        data: fileData.data 
      } 
    });
  }
  
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            overallAuthenticityScore: { type: Type.NUMBER },
            isDocumentAuthentic: { type: Type.BOOLEAN },
            documentForgeryAnalysis: { type: Type.STRING },
            summary: { type: Type.STRING },
            socialIntegrity: {
              type: Type.OBJECT,
              properties: {
                githubMatch: { type: Type.STRING, enum: ["Verified", "Mismatch", "Not Provided"] },
                linkedinMatch: { type: Type.STRING, enum: ["Verified", "Mismatch", "Not Provided"] },
                analysis: { type: Type.STRING }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER },
                  status: { type: Type.STRING, enum: ["Verified", "Needs Review", "Likely Exaggerated"] },
                  reasoning: { type: Type.STRING }
                }
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  issueDate: { type: Type.STRING },
                  credentialId: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = response.text;
    if (!result) throw new Error("No response");
    
    return JSON.parse(result) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Failed:", error);
    throw new Error("Analysis failed. Try again.");
  }
};
