# -*- coding: utf-8 -*-
"""Copy the certificates into public/ under stable slugs, upright.

Run after adding or replacing anything in Certificados/:

    pip install pypdf
    python scripts/sync-certificates.py

Two things this does that a plain copy cannot.

SLUGS. The PT and EN folders hold the same twelve Alura courses under different
titles, and each folder sorts differently, so the mapping is written out by hand
below rather than zipped by index. The slug is the join key: lib/content.ts points
at /certificados/<lang>/<slug>.pdf, and both languages share the slug so the
viewer can switch between them by swapping one path segment.

ROTATION. Alura exports the landscape artwork sideways onto a portrait A4 page
and leaves /Rotate at 0, so every viewer renders the certificate on its side and
is right to. Fixing that in CSS would rotate the viewer's own toolbar with it and
would not help the downloaded file, so the served copy declares the rotation
instead. The originals in Certificados/ are never modified.
"""
import os
import sys

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    sys.exit("pypdf nao instalado.  pip install pypdf")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The artwork sits 90 degrees counter-clockwise on the page, so the page has to
# turn 90 clockwise to stand it up.
ROTATE = 90

PT = {
    "airflow-pipeline":     "Apache Airflow orquestrando seu primeiro pipeline de dados.pdf",
    "sqlserver-intro":      "Microsoft SQL Server 2022 conhecendo SQL.pdf",
    "sqlserver-advanced":   "Microsoft SQL Server 2022 consultas avançadas.pdf",
    "modelagem-relacional": "Modelagem de banco de dados relacional entendendo SQL.pdf",
    "mongodb":              "MongoDB conhecendo um banco de dados NoSQL.pdf",
    "php-app":              "PHP criando sua aplicação.pdf",
    "php-organizado":       "PHP evolua seu conhecimento e organize seu código.pdf",
    "pipeline-oo":          "Pipeline de dados combinando Python e orientação a objeto.pdf",
    "pipeline-mongo-mysql": "Pipeline de dados integrando Python com MongoDB e MySQL.pdf",
    "python-requests":      "Python e APIs conhecendo a biblioteca Requests.pdf",
    "python-dados-1":       "Python para Dados primeiros passos.pdf",
    "python-dados-2":       "Python para Dados trabalhando com funções, estruturas de dados e exceções.pdf",
}
EN = {
    "airflow-pipeline":     "Apache Airflow Orchestrating Your First Data Pipeline.pdf",
    "sqlserver-intro":      "Microsoft SQL Server 2022 getting to know SQL.pdf",
    "sqlserver-advanced":   "Microsoft SQL Server 2022 Advanced Queries.pdf",
    "modelagem-relacional": "Relational Database Modeling Understanding SQL.pdf",
    "mongodb":              "MongoDB getting to know a NoSQL database.pdf",
    "php-app":              "PHP creating your application.pdf",
    "php-organizado":       "PHP Advance Your Skills and Write Better-Organized Code.pdf",
    "pipeline-oo":          "Data Pipeline Combining Python and Object Orientation.pdf",
    "pipeline-mongo-mysql": "Data Pipeline Integrating Python with MongoDB and MySQL.pdf",
    "python-requests":      "Python and APIs getting to know the Requests library.pdf",
    "python-dados-1":       "Python for Data Getting Started.pdf",
    "python-dados-2":       "Python for Data working with functions, data structures and exceptions.pdf",
}

assert set(PT) == set(EN), "os conjuntos de slug divergem entre PT e EN"


def upright(src, dst):
    """Copy one PDF with its pages turned upright."""
    reader = PdfReader(src)
    writer = PdfWriter()
    before = []
    for page in reader.pages:
        before.append(int(page.get("/Rotate", 0) or 0))
        page.rotate(ROTATE)
        writer.add_page(page)
    with open(dst, "wb") as f:
        writer.write(f)
    return before


def main():
    total = ok = 0
    for lang, table, folder in (("pt", PT, "Brasileiro"), ("en", EN, "English")):
        src_dir = os.path.join(ROOT, "Certificados", folder)
        dst_dir = os.path.join(ROOT, "public", "certificados", lang)
        os.makedirs(dst_dir, exist_ok=True)
        have = set(os.listdir(src_dir))

        for slug, name in sorted(table.items()):
            total += 1
            if name not in have:
                print("  FALTANDO  %s/%s" % (folder, name))
                continue
            src = os.path.join(src_dir, name)
            dst = os.path.join(dst_dir, slug + ".pdf")
            before = upright(src, dst)
            ok += 1
            print("  %-3s %-22s /Rotate %s -> %d   %6.0f KB"
                  % (lang, slug, before, (before[0] + ROTATE) % 360,
                     os.path.getsize(dst) / 1024))

        extra = have - set(table.values())
        if extra:
            print("\n  nao mapeado em %s (nao vai para o site):" % folder)
            for f in sorted(extra):
                print("    %s" % f)

    print("\n%d/%d copiados" % (ok, total))
    for lang in ("pt", "en"):
        d = os.path.join(ROOT, "public", "certificados", lang)
        files = os.listdir(d)
        mb = sum(os.path.getsize(os.path.join(d, f)) for f in files) / 1048576.0
        print("  public/certificados/%-3s %2d arquivos  %5.1f MB" % (lang, len(files), mb))


if __name__ == "__main__":
    main()
