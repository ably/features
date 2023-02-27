const fs = require('fs');
const escape = require('escape-html');
const { marked } = require('marked');
const {
  DocumentWriter,
  TableWriter,
} = require('./html');
const { MatrixGenerator, MatrixConsumer } = require('./matrix');

// from Google Fonts' Icons (originally called 'Close' and 'Done').
// https://fonts.google.com/icons
const svgSize = '1.5em';
const crossSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="${svgSize}" width="${svgSize}" viewBox="0 0 48 48"><path d="M12.45 37.65 10.35 35.55 21.9 24 10.35 12.45 12.45 10.35 24 21.9 35.55 10.35 37.65 12.45 26.1 24 37.65 35.55 35.55 37.65 24 26.1Z"/></svg>`;
const tickSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="${svgSize}" width="${svgSize}" viewBox="0 0 48 48"><path d="M18.9 35.7 7.7 24.5 9.85 22.35 18.9 31.4 38.1 12.2 40.25 14.35Z"/></svg>`;
const partialSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="${svgSize}" width="${svgSize}" viewBox="0 0 48 48"><path d="M10.4 26.4Q9.4 26.4 8.7 25.7Q8 25 8 24Q8 23 8.7 22.3Q9.4 21.6 10.4 21.6Q11.4 21.6 12.1 22.3Q12.8 23 12.8 24Q12.8 25 12.1 25.7Q11.4 26.4 10.4 26.4ZM24 26.4Q23 26.4 22.3 25.7Q21.6 25 21.6 24Q21.6 23 22.3 22.3Q23 21.6 24 21.6Q25 21.6 25.7 22.3Q26.4 23 26.4 24Q26.4 25 25.7 25.7Q25 26.4 24 26.4ZM37.6 26.4Q36.6 26.4 35.9 25.7Q35.2 25 35.2 24Q35.2 23 35.9 22.3Q36.6 21.6 37.6 21.6Q38.6 21.6 39.3 22.3Q40 23 40 24Q40 25 39.3 25.7Q38.6 26.4 37.6 26.4Z"/></svg>`;

const verticalBordersStyle = 'border-slate-300 border-b-2';

const title = 'Ably';

const commonFeatureCellStyle = `${verticalBordersStyle} border-r-2`;

/**
 * @implements {MatrixConsumer}
 */
class TableRenderer extends MatrixConsumer {
  constructor(tableWriter) {
    super();
    this.tableWriter = tableWriter;
  }

  onFeature(parentKeys, key, properties, maximumLevel) {
    const {
      specificationPoints,
      documentationUrls,
      requires,
      synopsis,
      isHeading,
    } = properties;
    const level = parentKeys.length;

    const { tableWriter } = this;
    tableWriter.class(`align-middle tooltip-container${isHeading ? ' bg-slate-200' : ''}`);
    const rowWriter = tableWriter.startRow();
    this.rowWriter = rowWriter; // used by calls to onCompliance() for this feature row

    // Indent using empty cells
    for (let i = 1; i <= level; i += 1) {
      rowWriter.class(`px-3 ${verticalBordersStyle}`);
      rowWriter.cell((cellContentWriter) => {
        cellContentWriter.write('&nbsp;');
      });
    }

    // Contents, with column spanning to fill remaining cells, after indentation
    const cellCount = maximumLevel - level;
    if (cellCount > 1) {
      rowWriter.columnSpan(cellCount);
    }
    rowWriter.class(`pr-3 whitespace-nowrap ${commonFeatureCellStyle} ${isHeading ? 'font-bold' : ''}`);
    rowWriter.cell((cellContentWriter) => {
      if (level > 0) {
        const tip = `<strong>${escape(parentKeys.join(': '))}</strong>: ${escape(key)}`;
        cellContentWriter.write(`<span class="tooltip-contents">${tip}</span>`);
      }
      cellContentWriter.text(key);
    });

    // Specification Points
    rowWriter.class(`px-1 ${commonFeatureCellStyle}`);
    rowWriter.cell((cellContentWriter) => {
      cellContentWriter.write(specificationPoints
        ? specificationPoints
          .map((element) => element.toHtmlLink())
          .join(', ')
        : '&nbsp;');
    });

    // Conceptual Documentation Links and Synopsis
    rowWriter.class(`px-1 ${commonFeatureCellStyle}`);
    rowWriter.cell((cellContentWriter) => {
      let empty = true;

      const markdownRequires = requires
        ? `Requires: ${requires.map((featureNodePath) => `**${featureNodePath.join(': ')}**`).join(' | ')}`
        : null;
      const markdown = synopsis
        ? `${synopsis}${markdownRequires ? `\n${markdownRequires}` : ''}`
        : markdownRequires;

      if (documentationUrls) {
        const needComplexLayout = !!markdown;

        if (needComplexLayout) {
          // With Synopsis and Documentation URLs we need a more complex layout
          cellContentWriter.write('<div class="flex flex-row">'); // this div is closed below, after writing documentation URLs
          cellContentWriter.write(`<div class="grow">${marked.parse(markdown)}</div>`);
          cellContentWriter.write('<div class="grow-0">'); // this div is closed below, after writing documentation URLs
        }

        cellContentWriter.write(documentationUrls
          .map((element) => `<a class="btn btn-blue" href="${element}" target="_blank" rel="noopener">${titleForLink(element)}</a>`)
          .join(' '));

        if (needComplexLayout) {
          cellContentWriter.write('</div></div>');
        }

        empty = false;
      } else if (markdown) {
        // No Documentation URLs, so simply render the Synopsis.
        cellContentWriter.write(marked.parse(markdown));
        empty = false;
      }
      if (empty) {
        cellContentWriter.write('&nbsp;');
      }
    });
  }

  onCompliance(compliance, manifest, featureProperties) {
    const { rowWriter } = this;
    const { isHeading } = featureProperties;

    let colourClass = 'bg-red-400';
    let svg = crossSvg;
    if (compliance) {
      const { caveats, variants } = compliance;
      const hasPartialSupportForVariants = variants && manifest.isPartialVariantsCoverage(variants);
      if (hasPartialSupportForVariants || caveats) {
        colourClass = 'bg-amber-400';
        svg = partialSvg;
      } else {
        colourClass = 'bg-green-400';
        svg = tickSvg;
      }
    }

    rowWriter.class(`px-1 ${isHeading ? '' : colourClass} ${commonFeatureCellStyle}`);
    rowWriter.cell((cellContentWriter) => {
      cellContentWriter.write('<div class="flex justify-center">');
      cellContentWriter.write(isHeading ? '&nbsp;' : svg);
      cellContentWriter.write('</div>');
    });
  }

  onFeatureFinished() {
    this.tableWriter.finishRow();
    this.rowWriter = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  onIgnoredNode(level, description) {
    const consoleIndent = ' '.repeat(2).repeat(level);
    console.log(`${consoleIndent}"${description}"`);
  }
}

/**
 * Render column headings to a table row.
 *
 * @param {TableWriter} writer The HTML table writer to use.
 * @param {number} maximumLevel The maximum depth, previously measured.
 * @param {string[]} sdkManifestSuffixes In the order they're to be explored for each feature, same as supplied to the generator.
 */
function renderTableHeaderRow(writer, maximumLevel, sdkManifestSuffixes) {
  writer.class('align-top sticky top-0 bg-blue-700 text-white font-bold');
  const commonCellStyle = 'pt-2 pb-2 border-y-4 border-white border-r-4 sticky top-0 align-middle';
  writer.row((rowWriter) => {
    rowWriter.columnSpan(maximumLevel);
    rowWriter.class(`pr-1 text-center ${commonCellStyle}`);
    rowWriter.cell((cellContentWriter) => {
      cellContentWriter.text('Feature');
    });

    // Specification Points
    rowWriter.class(`px-1 ${commonCellStyle}`);
    rowWriter.cell((cellContentWriter) => {
      cellContentWriter.text('Specification');
    });

    // Conceptual Documentation Links and Synopsis
    rowWriter.class(`px-1 ${commonCellStyle}`);
    rowWriter.cell((cellContentWriter) => {
      cellContentWriter.text('Synopsis and Links to Conceptual Documentation');
    });

    // SDK columns
    // eslint-disable-next-line no-restricted-syntax
    sdkManifestSuffixes.forEach((sdkManifestSuffix) => {
      rowWriter.class(`px-1 ${commonCellStyle}`);
      rowWriter.cell((cellContentWriter) => {
        cellContentWriter.write('<div class="-rotate-180 m-auto vertical-lr">');
        cellContentWriter.text(sdkManifestSuffix);
        cellContentWriter.write('</div>');
      });
    });
  });
}

/**
 * Writes an HTML document to file, containing the rendered matrix.
 *
 * @param {string} outputFilePath Where to create the HTML document.
 * @param {MatrixGenerator} generator To be used to generate the matrix, where this implementation is the consumer.
 * @param {string[]} sdkManifestSuffixes In the order they're to be explored for each feature, same as supplied to the generator.
 * @param {number} levelCount The depth of the canonical features tree being rendered.
 * @param {string} subTitle The sub-title to be used in tab title and H1.
 */
const writeDocument = (
  outputFilePath,
  generator,
  sdkManifestSuffixes,
  levelCount,
  subTitle,
) => {
  const documentWriter = new DocumentWriter(
    { title: `${subTitle} | ${title}` },
    fs.createWriteStream(outputFilePath),
  );

  documentWriter.document((contentWriter) => {
    contentWriter.h(1, `${title} ${subTitle}`);

    // Our convention, for this table, is borders to the right and bottom of cells.
    // (only exception being the top row, where there's also a border to the top)
    contentWriter.class('border-separate zero-border-spacing');

    contentWriter.table((tableWriter) => {
      renderTableHeaderRow(tableWriter, levelCount, sdkManifestSuffixes);

      // Second Pass: Render rows.
      generator.generate(levelCount, new TableRenderer(tableWriter));
    });
  });
};

/**
 * Returns a short title to be used as the button label for linking to the given URL.
 *
 * @param {url} url The URL to which the button will link.
 * @returns {string} A short title to be used as a button label.
 */
function titleForLink(url) {
  const titlesForPrefixes = [
    ['ably.com/blog', 'blog'],
    ['ably.com/docs', 'docs'],
    ['faqs.ably.com', 'faq'],
    ['github.com/ably/.*/issues', 'issue'],
  ];

  const foundPair = titlesForPrefixes.find((element) => (new RegExp(`https://${element[0]}/`)).test(url));
  return foundPair ? foundPair[1] : 'link';
}

module.exports = {
  writeDocument,
};
