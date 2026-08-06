import { jsPDF } from "jspdf";
import type { Story, BranchNode, Critique } from "@/types";
import { authorById } from "@/services/mock";

const MARGIN = 72;

function addCover(doc: jsPDF, title: string): void {
  doc.setFillColor(246, 244, 239);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
  doc.setTextColor(29, 29, 27);
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.text("Sprinter", MARGIN, 90);
  doc.setFont("times", "normal");
  doc.setFontSize(44);
  const lines = doc.splitTextToSize(title, doc.internal.pageSize.getWidth() - MARGIN * 2);
  doc.text(lines, MARGIN, 300);
  doc.setFontSize(12);
  doc.setTextColor(110, 106, 100);
  doc.setFont("helvetica", "normal");
  doc.text("A collaborative story, continued by many hands.", MARGIN, 360);
  doc.addPage();
}

export function exportStoryPdf(story: Story, nodes: BranchNode[]): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addCover(doc, story.title);

  const width = doc.internal.pageSize.getWidth() - MARGIN * 2;

  const seedAuthor = authorById(story.seedAuthorId);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 106, 100);
  doc.text(`${story.genres.join(" · ")}`, MARGIN, 70);
  doc.text(`Seeded by ${seedAuthor.penName} · ${story.words} words · ${story.readingMinutes} min`, MARGIN, 86);

  doc.setTextColor(29, 29, 27);
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.setLineHeightFactor(1.6);
  const seedLines = doc.splitTextToSize(story.body, width);
  doc.text(seedLines, MARGIN, 110);

  const allNodes = [...nodes].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  let y = 110 + seedLines.length * 20;

  for (const node of allNodes) {
    if (y > doc.internal.pageSize.getHeight() - 90) {
      doc.addPage();
      y = 70;
    }
    const author = authorById(node.authorId);
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(92, 115, 132);
    doc.text(node.title, MARGIN, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 106, 100);
    doc.text(`${node.type} · ${author.penName} · ${node.createdAt}`, MARGIN, y);
    y += 22;
    doc.setTextColor(29, 29, 27);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const bodyLines = doc.splitTextToSize(node.body, width);
    doc.text(bodyLines, MARGIN, y);
    y += bodyLines.length * 19 + 24;
  }

  doc.save(`${story.slug}.pdf`);
}

export function exportAnthologyPdf(
  title: string,
  season: string,
  stories: Story[],
  allNodes: BranchNode[],
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addCover(doc, title);

  const width = doc.internal.pageSize.getWidth() - MARGIN * 2;

  for (const story of stories) {
    let y = 70;
    const nodes = allNodes.filter((n) => n.storyId === story.id);
    const author = authorById(story.seedAuthorId);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(184, 155, 103);
    doc.text(season.toUpperCase(), MARGIN, y);
    y += 20;
    doc.setFont("times", "normal");
    doc.setFontSize(26);
    doc.setTextColor(29, 29, 27);
    doc.text(story.title, MARGIN, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 106, 100);
    doc.text(`by ${author.penName} · ${story.words} words`, MARGIN, y);
    y += 30;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setLineHeightFactor(1.6);
    const seedLines = doc.splitTextToSize(story.body, width);
    doc.text(seedLines, MARGIN, y);
    y += seedLines.length * 19 + 16;

    for (const node of nodes) {
      if (y > doc.internal.pageSize.getHeight() - 90) {
        doc.addPage();
        y = 70;
      }
      const nodeAuthor = authorById(node.authorId);
      doc.setFont("times", "italic");
      doc.setFontSize(13);
      doc.setTextColor(92, 115, 132);
      doc.text(node.title, MARGIN, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 106, 100);
      doc.text(`${node.type} · ${nodeAuthor.penName}`, MARGIN, y);
      y += 20;
      doc.setFont("times", "normal");
      doc.setFontSize(11.5);
      doc.setTextColor(29, 29, 27);
      const lines = doc.splitTextToSize(node.body, width);
      doc.text(lines, MARGIN, y);
      y += lines.length * 18 + 20;
    }

    if (stories.indexOf(story) < stories.length - 1) doc.addPage();
  }

  doc.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}

export function exportCritiquesPdf(story: Story, critiques: Critique[]): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addCover(doc, `${story.title} — Critiques`);
  const width = doc.internal.pageSize.getWidth() - MARGIN * 2;
  let y = 70;

  for (const critique of critiques) {
    if (y > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      y = 70;
    }
    const author = authorById(critique.authorId);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(184, 155, 103);
    doc.text(critique.isEditorial ? "EDITORIAL CRITIQUE" : "COMMUNITY CRITIQUE", MARGIN, y);
    y += 16;
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(29, 29, 27);
    doc.text(`by ${author.penName}`, MARGIN, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(92, 115, 132);
    const dimensions = ["emotion", "logic", "pacing", "imagery", "dialogue", "originality", "theme", "ending"] as const;
    const scoreText = dimensions.map((d) => `${d} ${critique.scores[d]}`).join("   ");
    const scoreLines = doc.splitTextToSize(scoreText, width);
    doc.text(scoreLines, MARGIN, y);
    y += scoreLines.length * 13 + 10;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(29, 29, 27);
    doc.setLineHeightFactor(1.6);
    const lines = doc.splitTextToSize(critique.reflection, width);
    doc.text(lines, MARGIN, y);
    y += lines.length * 19 + 32;
  }

  doc.save(`${story.slug}-critiques.pdf`);
}
