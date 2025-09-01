import jsPDF from 'jspdf'

export const downloadClientNotesAsPDF = (record, config = {}) => {
  const doc = new jsPDF()

  // Format the date from the record
  const recordDate = new Date(record.date)
  const formattedDate = recordDate.toLocaleDateString(
    [],
    config.dateOptions || {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  )

  // Initial setup
  doc.setFont('helvetica')
  doc.setFontSize(config.fontSize || 12)
  let currentY = config.startY || 10 // Starting Y position for the first section

  const pageHeight = doc.internal.pageSize.height
  const lineHeight = config.lineHeight || 6.5

  // Function to add a new page if needed
  const addNewPageIfNeeded = contentHeight => {
    if (currentY + contentHeight >= pageHeight) {
      doc.addPage()
      currentY = config.startY || 10 // Reset Y position to the top of the new page
    }
  }

  // Function to add a section of text
  const addSection = (title, content) => {
    doc.setFont('helvetica', 'bold')
    addNewPageIfNeeded(lineHeight) // Check if a new page is needed for the title
    doc.text(title, 10, currentY)
    currentY += config.sectionTitleSpacing || 7

    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(content, config.contentWidth || 180)
    addNewPageIfNeeded(lines.length * lineHeight) // Check if a new page is needed for the content
    doc.text(lines, 10, currentY)
    currentY += lines.length * lineHeight + (config.sectionSpacing || 5) // Adjust space after section
  }

  // Add headers and sections
  doc.setFont('helvetica', 'bold')
  addNewPageIfNeeded(lineHeight * 3) // Check space for header lines
  doc.text(`Client Name: ${record.client.name}`, 10, currentY)
  currentY += lineHeight
  doc.text(`Date: ${formattedDate}`, 10, currentY)
  currentY += lineHeight * 2 // Extra space before starting sections

  // Define the order of sections manually
  const sectionOrder = [
    'notes',
    'nutrition_targets',
    'wins',
    'obstacles',
    'topics_to_discuss',
    'last_check_in_call_report',
    'recap_or_homework',
  ]

  // Add sections dynamically based on the specified order and provided record
  sectionOrder.forEach(sectionName => {
    const content = record.notes[sectionName]
    if (content) {
      const sectionTitle =
        sectionName.charAt(0).toUpperCase() +
        sectionName.slice(1).replace(/_/g, ' ') // Replace underscores with spaces for title
      const sectionContent =
        typeof content === 'string'
          ? content
          : Object.entries(content)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
      addSection(sectionTitle, sectionContent)
    }
  })

  // Save the PDF with a dynamic name based on record's name and current date
  const fileName = `Client-Record-${
    record?.client?.name
  }-${new Date().toLocaleDateString()}.pdf`
  doc.save(fileName)
}

// Define a mapping from species names to their respective image files
const speciesImageMap = {
  bird: 'cartoon_bird.jpg',
  cat: 'cartoon_cat.jpg',
  dog: 'cartoon_dog.jpg',
  hamster: 'cartoon_hamster.jpg',
}

/**
 * Returns the image URL for a given species.
 * @param {string} species - The species name.
 * @return {string} - The image URL.
 */
export const getSpeciesImageUrl = species => {
  // const imageName = speciesImageMap[species?.toLowerCase()] || 'dog.jpg'
  // return `/images/${imageName}`
  return '/images/user_profile.jpg'
}

export default {
  downloadClientNotesAsPDF,
  getSpeciesImageUrl,
}
