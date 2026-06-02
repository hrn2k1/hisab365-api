import { User } from '../models/User';
import { Location } from '../models/Location';
import { Counter } from '../models/Counter';
import Account from '../models/Account';
import { connectDatabase, disconnectDatabase } from '../config/database';

const BANGLADESH_LOCATION_DATA: Array<{ division: string; districts: string[] }> = [
  {
    division: 'Dhaka',
    districts: [
      'Dhaka',
      'Faridpur',
      'Gazipur',
      'Gopalganj',
      'Kishoreganj',
      'Madaripur',
      'Manikganj',
      'Munshiganj',
      'Narayanganj',
      'Narsingdi',
      'Rajbari',
      'Shariatpur',
      'Tangail',
    ],
  },
  {
    division: 'Khulna',
    districts: [
      'Bagerhat',
      'Chuadanga',
      'Jashore',
      'Jhenaidah',
      'Khulna',
      'Kushtia',
      'Magura',
      'Meherpur',
      'Narail',
      'Satkhira',
    ],
  },
  {
    division: 'Chattogram',
    districts: [
      'Bandarban',
      'Brahmanbaria',
      'Chandpur',
      'Chattogram',
      'Comilla',
      "Cox's Bazar",
      'Feni',
      'Khagrachhari',
      'Lakshmipur',
      'Noakhali',
      'Rangamati Hill',
    ],
  },
  {
    division: 'Rajshahi',
    districts: [
      'Bogra',
      'Joypurhat',
      'Naogaon',
      'Natore',
      'Chapainawabganj',
      'Pabna',
      'Rajshahi',
      'Sirajganj',
    ],
  },
  {
    division: 'Sylhet',
    districts: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  },
  {
    division: 'Rangpur',
    districts: [
      'Dinajpur',
      'Gaibandha',
      'Kurigram',
      'Lalmonirhat',
      'Nilphamari',
      'Panchagarh',
      'Rangpur',
      'Thakurgaon',
    ],
  },
  {
    division: 'Mymensingh',
    districts: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
  },
  {
    division: 'Barisal',
    districts: [
      'Jhalakathi',
      'Barguna',
      'Barisal',
      'Bhola',
      'Patuakhali',
      'Pirojpur',
    ],
  },
];

async function seedBangladeshLocations() {
  console.log('Seeding Bangladesh divisions and districts...');

  console.log('Clearing existing division and district locations...');
  await Location.deleteMany({ type: { $in: ['division', 'district'] } });
  console.log('✓ Cleared existing division and district locations');

  const divisionIdMap: Record<string, number> = {};

  for (const item of BANGLADESH_LOCATION_DATA) {
    const division = await Location.create({
      type: 'division',
      name: item.division,
      parentId: null,
    });

    divisionIdMap[item.division] = division._id as number;
  }

  for (const item of BANGLADESH_LOCATION_DATA) {
    const parentId = divisionIdMap[item.division];

    for (const district of item.districts) {
      await Location.create({
        type: 'district',
        name: district,
        parentId,
      });
    }
  }

  const divisionCount = Object.keys(divisionIdMap).length;
  const districtCount = BANGLADESH_LOCATION_DATA.reduce(
    (total, item) => total + item.districts.length,
    0
  );

  console.log(
    `✓ Seeded ${divisionCount} divisions and ${districtCount} districts into locations collection`
  );
}

/**
 * Fix database by dropping old indexes and clearing data
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
