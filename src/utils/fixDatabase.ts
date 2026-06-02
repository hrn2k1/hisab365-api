import { User } from '../models/User';
import { Location } from '../models/Location';
import { Counter } from '../models/Counter';
import Account from '../models/Account';
import { connectDatabase, disconnectDatabase } from '../config/database';
import fs from 'fs';
import path from 'path';

type ThanaSeed = {
  name: string;
};

type DistrictSeed = {
  name: string;
  thanas: ThanaSeed[];
};

type DivisionSeed = {
  name: string;
  districts: DistrictSeed[];
};

function loadLocationsSeedData(): DivisionSeed[] {
  const locationsJsonPath = path.resolve(process.cwd(), 'locations.json');

  if (!fs.existsSync(locationsJsonPath)) {
    throw new Error(`locations.json not found at ${locationsJsonPath}`);
  }

  const raw = fs.readFileSync(locationsJsonPath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid locations.json format: root value must be an array');
  }

  return parsed as DivisionSeed[];
}


async function seedBangladeshLocations() {
  console.log('Seeding Bangladesh divisions, districts and thanas from locations.json...');

  const seedData = loadLocationsSeedData();

  console.log('Clearing existing division, district and thana locations...');
  await Location.deleteMany({ type: { $in: ['division', 'district', 'thana'] } });
  console.log('✓ Cleared existing division, district and thana locations');

  let divisionCount = 0;
  let districtCount = 0;
  let thanaCount = 0;

  for (const item of seedData) {
    const division = await Location.create({
      type: 'division',
      name: item.name,
      parentId: null,
    });

    divisionCount += 1;

    for (const district of item.districts) {
      const districtLocation = await Location.create({
        type: 'district',
        name: district.name,
        parentId: division._id as number,
      });

      districtCount += 1;

      for (const thana of district.thanas) {
      await Location.create({
        type: 'thana',
          name: thana.name,
          parentId: districtLocation._id as number,
      });

        thanaCount += 1;
      }
    }
  }

  console.log(
    `✓ Seeded ${divisionCount} divisions, ${districtCount} districts and ${thanaCount} thanas into locations collection`
  );
}

/**
 * Fix database by dropping old indexes and clearing data
 * npm run fix-db -- --fix-only-locations=true
 */
function getFixOnlyLocationsArg(): boolean {
  const argument = process.argv.find((arg) => arg.startsWith('--fix-only-locations='));

  if (!argument) {
    return false;
  }

  const value = argument.split('=')[1]?.trim().toLowerCase();

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  console.log(
    'Note: Invalid --fix-only-locations value. Use true or false. Falling back to false.'
  );
  return false;
}

async function fixDatabase(fixOnlyLocations: boolean = false) {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    if (fixOnlyLocations) {
      console.log('Running in location-only mode...');
      await seedBangladeshLocations();
      console.log('✓ Location-only database fix completed successfully');
      await disconnectDatabase();
      return;
    }

    // Clear Users collection
    console.log('Dropping old indexes on users collection...');
    try {
      await User.collection.dropIndexes();
      console.log('✓ Dropped users indexes');
    } catch (error) {
      console.log('Note: Could not drop users indexes (they may not exist)');
    }

    console.log('Clearing users collection...');
    await User.deleteMany({});
    console.log('✓ Cleared users collection');

    console.log('Recreating users indexes...');
    await User.collection.createIndex({ contactNumber: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Recreated users indexes');

    // Clear Locations collection
    console.log('Dropping old indexes on locations collection...');
    try {
      await Location.collection.dropIndexes();
      console.log('✓ Dropped locations indexes');
    } catch (error) {
      console.log('Note: Could not drop locations indexes (they may not exist)');
    }

    console.log('Clearing locations collection...');
    await Location.deleteMany({});
    console.log('✓ Cleared locations collection');

    /*
    // Clear Accounts collection
    console.log('Dropping old indexes on accounts collection...');
    try {
      await Account.collection.dropIndexes();
      console.log('✓ Dropped accounts indexes');
    } catch (error) {
      console.log('Note: Could not drop accounts indexes (they may not exist)');
    }

    console.log('Clearing accounts collection...');
    await Account.deleteMany({});
    console.log('✓ Cleared accounts collection');
*/
    // Clear Counter collection
    console.log('Clearing counter collection...');
    await Counter.deleteMany({});
    console.log('✓ Cleared counter collection');

    await seedBangladeshLocations();

    console.log('✓ Database fixed successfully');
    await disconnectDatabase();
  } catch (error) {
    console.error('✗ Error fixing database:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

fixDatabase(getFixOnlyLocationsArg());
