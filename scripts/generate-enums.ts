import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type TEnum = {
  name: string;
  values: string[];
}

const prismaSchemaPath = join(__dirname, '../prisma/schema.prisma');
const outputPath = join(__dirname, '../../front/src/types/Enums.ts');

async function generateEnums() {
  try {
    const schema = readFileSync(prismaSchemaPath, 'utf-8');
    
    const enumRegex = /enum\s+(\w+)\s*{([^}]+)}/g;
    const enums: TEnum[] = [];
    let match;
    
    while ((match = enumRegex.exec(schema)) !== null) {
      const enumName = match[1];
      const enumValues = match[2]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .map(line => line.replace(',', ''));
      
      enums.push({ name: enumName, values: enumValues });
    }
    
    let tsCode = '// This file is auto-generated. Do not edit manually.\n\n';
    
    enums.forEach(enumType => {
      tsCode += `export enum E${enumType.name} {\n`;
      enumType.values.forEach(value => {
        tsCode += `  ${value} = '${value}',\n`;
      });
      tsCode += '}\n\n';
    });
    
    writeFileSync(outputPath, tsCode);
    
    console.log('✅ Enums have been generated successfully!');
  } catch (error) {
    console.error('❌ Error generating enums:', error);
    process.exit(1);
  }
}

generateEnums(); 