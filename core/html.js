const escape = require('escape-html');
const fs = require('fs');

/**
 * Callback populating a table.
 *
 * @callback TableGenerator
 * @param {TableWriter} writer Used to create rows in the table.
 * @returns {void}
 */

/**
 * Callback populating a table row.
 *
 * @callback TableRowGenerator
 * @param {TableRowWriter} writer Used to create cells in the table row.
 * @returns {void}
 */

/**
 * Callback populating content.
 *
 * @callback ContentGenerator
 * @param {ContentWriter} writer Used to create content.
 * @returns {void}
 */

/**
 * Callback populating a document.
 *
 * @callback DocumentGenerator
 * @param {DocumentWriter} writer Used to create content.
 * @returns {void}
 */

class Writer {
  /**
   * @param {fs.WriteStream} writeStream The stream to wrap.
   */
  constructor(writeStream) {
    this.writeStream = writeStream;
  }

  class(classNames) {
    this.classAttributeValue = classNames;
  }

  /**
   * Consumes the attribute value(s) and then resets them to undefined.
   * The idea is that this method is called when the next element is generated.
   *
   * @returns {string[]} Zero or more attribute strings in `key=value` form.
   */
  useAttributes() {
    const classValue = this.classAttributeValue;
    this.classAttributeValue = undefined;
    return classValue ? [`class="${classValue}"`] : [];
  }

  /**
   * Write raw HTML.
   *
   * @param {string} chunk The raw contents to write.
   */
  write(chunk) {
    this.writeStream.write(chunk);
  }

  /**
   * Write plain text, with HTML special characters escaped.
   *
   * @param {string} text The plain text to write.
   */
  text(text) {
    this.write(escape(text));
  }
}

class ContentWriter extends Writer {
  h(depth, text) {
    const attributes = this.useAttributes();
    this.write(`<h${depth} ${attributes.join(' ')}>${escape(text)}</h${depth}>`);
  }

  /**
   * Create a table.
   *
   * @param {TableGenerator} generator Code to populate the table. Called synchronously.
   */
  table(generator) {
    const attributes = this.useAttributes();
    this.write(`<table ${attributes.join(' ')}>`);
    generator(new TableWriter(this.writeStream));
    this.write('</table>');
  }
}

/**
 * Utility wrapping a writeable stream, offering methods to fluidly write an HTML document to it.
 */
class DocumentWriter extends ContentWriter {
  constructor(properties, writeStream) {
    super(writeStream);
    this.properties = properties ?? {};
    this.documentCalled = false;
  }

  /**
   * Create the document.
   * This method may only be called once.
   *
   * @param {ContentGenerator} generator Code to populate the document. Called synchronously.
   */
  document(generator) {
    if (this.documentCalled) {
      throw new Error('Only a single document may be written for a single writer instance.');
    }
    this.documentCalled = true;

    this.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            .vertical-lr { writing-mode: vertical-lr; }
          </style>
          <style type="text/tailwindcss">
            @layer base {
              h1 {
                @apply text-2xl font-bold;
              }
              ul {
                @apply list-disc pl-5 mb-2;
              }
              p {
                @apply mb-2;
              }
              code {
                @apply text-slate-600 bg-amber-100;
              }
              a code {
                @apply bg-inherit hover:text-amber-700 hover:font-semibold;
              }
              a {
                @apply hover:underline hover:text-amber-700;
              }
              .tooltip-contents {
                @apply invisible rounded-md shadow-lg py-1 px-2 bg-gray-200 border-2 border-amber-500 absolute -mt-9 -ml-2;
              }
              .tooltip-container {
                @apply cursor-default;
              }
              .tooltip-container:hover .tooltip-contents {
                @apply visible z-50;
              }
              .tooltip-container:hover {
                @apply bg-amber-100;
              }

              /*
              * btn styles taken from:
              * https://v1.tailwindcss.com/components/buttons#simple
              * Adding inline-block here for a element.
              */
              a.btn {
                @apply inline-block;
              }
              .btn {
                @apply font-bold py-1 px-2 rounded;
              }
              .btn-blue {
                @apply bg-blue-500 text-white;
              }
              .btn-blue:hover {
                @apply bg-blue-700 text-white;
              }
            }

            /*
            * TODO consider why this class is defined in this layer, not base.
            * Clearly, Stackoverflow told me to, but I need to learn more about Tailwind to see why or if needed.
            */
            @layer components {
              /*
              * We need this to combine with border-seperate, in order not to have gaps between
              * borders of cells within a table.
              * It's seemingly not a utility offered, out-of-the-box, by Tailwind - see:
              * https://stackoverflow.com/a/70326229/392847
              */
              .zero-border-spacing {
                border-spacing: 0;
              }
            }
          </style>
          <title>${this.properties.title || 'Document'}</title>
        </head>
        <body>
          <div class="my-1 mx-2">
    `);
    generator(new ContentWriter(this.writeStream));
    this.write(`
          </div>
        </body>
      </html>
    `);
  }
}

class TableWriter extends Writer {
  /**
   * Create a table row.
   *
   * @param {TableRowGenerator} generator Code to populate the table row. Called synchronously.
   */
  row(generator) {
    generator(this.startRow());
    this.finishRow();
  }

  /**
   * Create a table row. The finishRow() method must be called after the row has been populated using the returned writer.
   *
   * @returns {TableRowWriter} The writer to be used to populate content for this row.
   */
  startRow() {
    if (this.inTableRow) {
      throw new Error('Already within startRow() for this TableWriter.');
    }

    const attributes = this.useAttributes();
    this.write(`<tr ${attributes.join(' ')}>`);
    this.inTableRow = true;
    return new TableRowWriter(this.writeStream);
  }

  /**
   * Finish a table row. This method must be called after a matching call to startRow().
   */
  finishRow() {
    if (!this.inTableRow) {
      throw new Error('Not seen startRow() for this TableWriter.');
    }

    this.write('</tr>');
    this.inTableRow = false;
  }
}

class TableRowWriter extends Writer {
  columnSpan(count) {
    this.columnSpanAttributeValue = count;
  }

  useAttributes() {
    const attributes = super.useAttributes();
    const columnSpanValue = this.columnSpanAttributeValue;
    this.columnSpanAttributeValue = undefined;
    return columnSpanValue ? [`colspan=${columnSpanValue}`, ...attributes] : attributes;
  }

  /**
   * Create a table cell.
   *
   * @param {ContentGenerator} generator Code to populate the table cell. Called synchronously.
   */
  cell(generator) {
    const attributes = this.useAttributes();
    this.write(`<td ${attributes.join(' ')}>`);
    generator(new ContentWriter(this.writeStream));
    this.write('</td>');
  }
}

module.exports = {
  DocumentWriter,
  TableWriter,
};
