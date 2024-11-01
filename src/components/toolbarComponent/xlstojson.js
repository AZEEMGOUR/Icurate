import * as XLSX from 'xlsx';

const parseExcelToJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Check if required sheets exist
        const sheets = workbook.SheetNames;
        console.log('Sheets available:', sheets);
        
        if (!sheets.includes('matrix_inputs')) {
          console.error('Sheet "matrix_inputs" not found!');
          return reject(new Error('Missing sheet: matrix_inputs'));
        }
        if (!sheets.includes('layer_inputs')) {
          console.error('Sheet "layer_inputs" not found!');
          return reject(new Error('Missing sheet: layer_inputs'));
        }

        // Log each sheet to see if it's loaded correctly
        const matrixInputsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['matrix_inputs']);
        const layerInputsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['layer_inputs']);
        const globalPinInfoSheet = XLSX.utils.sheet_to_json(workbook.Sheets['global_pin_info']);
        const localPinInfoSheet = XLSX.utils.sheet_to_json(workbook.Sheets['local_pin_info']);
        const setupSheet = XLSX.utils.sheet_to_json(workbook.Sheets['setup']);
        
        console.log('matrix_inputs sheet content:', matrixInputsSheet);
        console.log('layer_inputs sheet content:', layerInputsSheet);
        console.log('global_pin_info sheet content:', globalPinInfoSheet);
        console.log('local_pin_info sheet content:', localPinInfoSheet);
        console.log('setup sheet content:', setupSheet);

        // Parse Matrix Inputs with checks for undefined data
        const matrixInputs = {
          top_cell: matrixInputsSheet[0] && matrixInputsSheet[0]['Unnamed: 1'] ? matrixInputsSheet[0]['Unnamed: 1'] : 'TOP',
          rows: matrixInputsSheet.slice(1).map(row => Object.values(row).slice(1, 5) || []),  // Handle missing rows
          height: matrixInputsSheet.slice(1).map(row => row['Unnamed: 1'] || 0),  // Handle missing heights
          width: Object.values(matrixInputsSheet[0] || []).slice(2) || [],  // Handle missing width values
          global_net: matrixInputsSheet.slice(1).map(row => row['Vdd, Vss'] ? row['Vdd, Vss'].split(', ') : [])
        };

        // Parse Layer Inputs
        const layerInputs = {};
        layerInputsSheet.forEach(row => {
          if (row && row['layerName']) {
            layerInputs[row['layerName']] = {
              layer_number: JSON.parse(row['layer_number']),
              label_number: JSON.parse(row['label_number']),
              blockage_layer: JSON.parse(row['blockage_layer'])
            };
          } else {
            console.warn('Skipping invalid row in layer_inputs:', row);
          }
        });

        // Parse Global Pin Info
        const globalPinInfo = globalPinInfoSheet.map(pin => ({
          name: pin.name,
          width: pin.width,
          spacing: {
            self: pin.spacing_self,
            other: pin.spacing_other
          },
          repetition: pin.repetition,
          clubbing: pin.clubbing
        }));

        // Parse Local Pin Info
        const localPinInfo = localPinInfoSheet.map(pin => ({
          cell_name: pin.cell_name,
          signal_name: pin.signal_name,
          repetition: pin.repetition
        }));

        // Parse Setup with error handling for undefined values
        const setup = {
          global_pin: {
            offset: setupSheet[0] && setupSheet[0]['global_pin_offset'] ? setupSheet[0]['global_pin_offset'] : 0,
            direction: setupSheet[1] && setupSheet[1]['global_pin_direction'] ? setupSheet[1]['global_pin_direction'] : 'default'
          },
          local_pin: {
            offset: setupSheet[1] && setupSheet[1]['local_pin_offset'] ? JSON.parse(setupSheet[1]['local_pin_offset']) : [0, 0],
            side: setupSheet[2] && setupSheet[2]['local_pin_side'] ? setupSheet[2]['local_pin_side'] : 'default',
            width: setupSheet[3] && setupSheet[3]['local_pin_width'] ? setupSheet[3]['local_pin_width'] : 0,
            length: setupSheet[4] && setupSheet[4]['local_pin_length'] ? setupSheet[4]['local_pin_length'] : 0,
            spacing: setupSheet[5] && setupSheet[5]['local_pin_spacing'] ? setupSheet[5]['local_pin_spacing'] : 0
          },
          blockage: {
            min_width: setupSheet[6] && setupSheet[6]['blockage_min_width'] ? setupSheet[6]['blockage_min_width'] : 0,
            spacing_to_pin: setupSheet[7] && setupSheet[7]['blockage_spacing_to_pin'] ? setupSheet[7]['blockage_spacing_to_pin'] : 0
          },
          label: {
            enclosure: setupSheet[8] && setupSheet[8]['label_enclosure'] ? setupSheet[8]['label_enclosure'] : 'default',
            size: setupSheet[9] && setupSheet[9]['label_size'] ? setupSheet[9]['label_size'] : 0,
            orientation: setupSheet[10] && setupSheet[10]['label_orientation'] ? setupSheet[10]['label_orientation'] : 'default'
          },
          precision: setupSheet[11] && setupSheet[11]['precision'] ? setupSheet[11]['precision'] : 0,
          unit: setupSheet[12] && setupSheet[12]['unit'] ? setupSheet[12]['unit'] : 'default',
          limit_to_size: setupSheet[13] && setupSheet[13]['limit_to_size'] ? setupSheet[13]['limit_to_size'] : 'default'
        };

        // Build the JSON structure
        const jsonStructure = {
          matrix_inputs: matrixInputs,
          layer_inputs: layerInputs,
          global_pin_info: globalPinInfo,
          local_pin_info: localPinInfo,
          setup: setup
        };

        console.log('Final JSON structure:', JSON.stringify(jsonStructure, null, 2));  // Log final JSON structure
        resolve(jsonStructure);  // Resolve the promise with the parsed JSON
      } catch (error) {
        console.error('Error while parsing Excel file:', error);
        reject(error);  // Reject the promise if there's an error
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export default parseExcelToJSON;
