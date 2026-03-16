import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase"; 
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Inicializa Firebase Admin para verificar o token
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { relato } = await req.json();

    if (!relato) {
      return NextResponse.json({ error: "Relato vazio" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const prompt = `Você é um analista de suporte. Analise o erro abaixo e extraia os dados.
    Retorne APENAS um JSON:
    {
      "categoria": "string",
      "subcategoria": "string",
      "palavras_chave": ["tag1", "tag2"],
      "gravidade_estimada": 1-5,
      "resumo": "string"
    }
    Relato: ${JSON.stringify(relato)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const dadosExtraidos = JSON.parse(cleanJson);

    // Salvando no Firestore com o userId
    const docRef = await addDoc(collection(db, "relatos_suporte"), {
      userId: userId, // Adiciona o ID do usuário
      relato_original: relato,
      ...dadosExtraidos,
      data_registro: serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id, 
      dados: dadosExtraidos 
    });

  } catch (error: any) {
    console.error("ERRO DETALHADO:", error);
    return NextResponse.json({ 
      error: "Erro no processamento", 
      details: error.message 
    }, { status: 500 });
  }
}