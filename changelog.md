# 10.0.14
* Fixed/Updated:
  * Class Features: Devil's Sight
  * Items: Winged Boots 
  * Spells: Spare the Dying

* Added Automation to:
  * Barbarian: Path of the Beast
  * Cleric: Twilight Domain
  * Druid: Circle of Stars
  * Paladin: Oath of Devotion
  * Wizard: School of Divination
  * Spells: See Invisibility

# 10.0.13
* Fixed/Updated:
  * Creature Features: Animate Vines
  * Feats: Heavily Armored, Infernal Constitution
  * Items: cleaned up stray damage flavors
  * Racial Traits: Relentless Endurance
  * Rogue: Sneak Attack (handle Versatile Sneak Attack feat)
  * Spells: Spiritual Weapon, Wall of Fire (line), Wall of Thorns

* Added Automation to:
  * Cleric: Warding Flare
  * Feats: Flames of Phlegethos, Gift of the Chromatic Dragon, Gift of the Gem Dragon, Gift of the Metallic Dragon, 
      Second Chance, Spell Sniper, Tavern Brawler
  * Spells: Animate Objects, Bigby's Hand, Find Familiar, Wall of Sand

# 10.0.12
* Fixed/Updated:
  * Creatures: Updated some tokens
  * Items: Potion of Invisibility
  * Races: Fixed subtype setting for all applicable races

* Added Automation to:
  * Actions: Dodge, Grapple, Help, Shove 
  * Creatures: Dryad, Ghoul
  * Creature Features: Animate Vines
  * Items: Pearl of Power, Pearl of Wisdom
  * Spells: Blink

# 10.0.11
* Fixed/Updated:
  * Bard: Bardic Inspiration, Combat Inspiration, Countercharm
  * Centaur
  * Fighter: Precision Attack
  * Spells: Chill Touch, Friends, Frostbite, Gust, Heat Metal, Lathander's Holy Dart, Lightning bolt (animation),
    Magic Stone, Moonbeam, Primal Savagery, Produce Flame, 
    Ray of Frost, Shocking Grasp, Sword Burst, Vicious Mockery, Wysard's Snowball
  * SaveHandler to also look at active effects in addition to features i.e. Countercharm
  * Push/Pull adjusted pixels to properly handle diagonal targets:
    * Feats: Charger, Shield Master, Telekinetic
    * Class Features: Pushing Attack, Repelling Blast, Thunderbolt Strike
    * Racial Features: Metallic Breath Weapon - Repulsion
    * Spells: Cloudkill, Thunderous Smite, Thunderwave

* Added Automation to:
  * College of Valor
  * MooseTaur
  * Rune Knight
  * Swarmkeeper
  * Spells: Blade Ward, Create Bonfire, Infestation, Lightning Lure, Sapping Sting

# 10.0.10
* Fixed/Updated:
  * Bug in the SaveHandler 
  * Class Features: Reckless Attack 
  * Races: Bugbear, Lizardfolk

* Added Automation to:
  * Path of the Totem Warrior

# 10.0.9
* Fixed/Updated:
  * Channel Divinity: Preserve Life, Inspiring Smite
  * Cleric: Blessing of the Forge
  * Combat Maneuvers: Disarming Attack, Goading Attack, Menacing Attack, Pushing Attack, Trip Attack
  * Creature Features: Death Lance
  * Creatures: Scripted fix of all weapon item targeting and reach, Mage, Poison Weird, Treant
  * Feats: Empowered Cantrips
  * Items: all injury poisons to support poison resilience, Tentacle Rod, Dagger of Venom
  * Monk: Stunning Strike
  * Races: Dwarven Resilience, Fey Step (Autumn), Fey Step (Winter), Necrotic Shroud, All elves and half-elves, Locathah,
    Draconic Cry, Radiant Consumption
  * Rogue: Sneak Attack
  * Spells: Barkskin, Heat Metal, Maximilian's Earthen Grasp, Light, Bounding Boulder, Mass Healing Word, Dimension Door, 
    Thorn Whip, Dispel Magic
  * Subclasses: auto grant all subclass bonus spells except Circle of the Land
  * Warlock: Genie's Wrath

* Added Automation to:
  * Creatures: Shadow, all Kobolds, all Orcs, all Goblins
  * Races: poison resilience features, Fey Ancestry
  * Spells: Entangle, Fog Cloud

* Added Items:
  * Scraps of Hide
  
# 10.0.8
* Fixed/Updated:
  * Spells: Chill Touch (stop regeneration), Light

* Added Automation to:
  * Added a general grapple handler to the HomebrewMacros
  * Creatures: Assassin Vine, Hobgoblin, Hobgoblin Captain, Hobgoblin Devastator, Hobgoblin Iron Shadow, Hobgoblin Warlord,
    Bearded Devil, Wolf, Dire Wolf, Winter Wolf, Centaur, Owlbear
  * Barbarian: Warrior of the Gods
  * Rogue: Supreme Sneak

* General Changes:
  * Consolidated and optimized all hobgoblin images

# 10.0.7
* Fixed/Updated:
  * Injury poisons: removed the destroy on empty flag for injury poisons as it breaks the automation

* Added Automation to:
  * Creatures: Drow, Drow Arachnomancer, Drow Assassin, Drow Elite Warrior, Drow Favored Consort, Drow Gunslinger,
    Drow House Captain, Drow Inquisitor, Drow Inquisitor (Summoner Variant), Drow Mage, Drow Matron Mother,
    Drow Mother of Rebellion, Drow Priestess of Lolth, Drow Shadowblade, Drow Shadowblade (Summoner Variant), 
    Drow Spore Servant, Mutated Drow, K’thriss Drow’b
  * Creatures: Glabrezu, Ligotti, Quasit, Shadow Demon, Yochlol
  * Features: Fiendish Resilience
  * Items: Robe of Stars
  * Spells: Banishment, Bounding Boulder, Confusion, Darkness, Evard's Black Tentacles, Faerie Fire,
    Mass Cure Wounds, Mass Healing Word, Power Word Stun, Spike Growth, Web

* General Changes:
  * Consolidated and optimized all drow images 

# 10.0.6
* Fixed/Updated:
  * Class Feature: Evasion
  * Item: all injury poisons - 3 ammo effect
  * Rogue: Sneak Attack - fixed out of combat bug, updated to work on NPC's
  * Spells: Lesser Restoration, Levitate, Shield
  
* Added Automation to:
  * Druid: Circle of the Shepherd - all features except Faithful Summons
  * Item: Dagger of Venom
  * Potion of Fire Breath
  * Ranger: Gloom Stalker - all features
  * Spells: Cloudkill, Freedom of Movement, Greater Invisibility, Harm, Suggestion
  
* General Changes:
  * Moved mirror image script to the module. So, there is currently no more need for world scripts. 

# 10.0.5
* Fixed/Updated:
  * Aasimar: Necrotic Shroud
  * Aasimar: Radiant Consumption
  * Aasimar: Radiant Soul
  * Barbarian: Ancestral Protectors
  * Barbarian: Divine Fury
  * Barbarian: Zealous Presence
  * Bard: Dash through the Shadows
  * Channel Divinity: Destructive Wrath
  * Channel Divinity: Inspiring Smite
  * Channel Divinity: Preserve Life
  * Channel Divinity: Sacred Weapon
  * Channel Divinity: Turn the Unholy
  * Cleric: All Divine Strike options
  * Cleric: Blessed Healer
  * Cleric: Disciple of Life
  * Cleric: Thunderbolt Strike
  * Creature: all with Pack Tactics
  * Creature: Drow
  * Creature: Drow Arachnomancer
  * Creature Feature: Pack Tactics
  * Druid: Blazing Revival
  * Druid: Cauterizing Flames
  * Druid: Enhanced Bond
  * Druid: Wildfire Spirit
  * Eladrin: all features
  * Feat: All Elemental Adept's
  * Feat: Empowered Cantrips
  * Fighter: Relentless
  * Item: Cloak of Displacement
  * Item: Driftglobe
  * Item: Figurine of Wondrous Power (Silver Raven)
  * Item: Holy Water
  * Kobold: Draconic Cry
  * Lizardfolk: Hungry Jaws
  * Metamagic: Careful Spell
  * Metamagic: Distant Spell
  * Metamagic: Extended Spell
  * Metamagic: Quickened Spell
  * Metamagic: Subtle Spell
  * Metamagic: Transmuted Spell
  * Metamagic: Twinned Spell
  * Monk: Deflect Missiles
  * Monk: Searing Arc Strike
  * Monk: Shadow Step
  * Monk: Stunning Strike
  * Paladin: Divine Smite (eliminate thrown weapon attacks)
  * Paladin: Glorious Defense
  * Paladin: Purity of Spirit
  * Rogue: Rakish Audacity
  * Sorcerer: Empowered Healing
  * Sorcerer: Hound of Ill Omen
  * Sorcerer: Shadow Walk
  * Sorcerer: Umbral Form
  * Spell: Armor of Agathys
  * Spell: Booming Blade
  * Spell: Branding Smite
  * Spell: Chaos Bolt
  * Spell: Color Spray
  * Spell: Conjure Animals
  * Spell: Conjure Minor Elementals
  * Spell: Dancing Lights 
  * Spell: Darkness
  * Spell: Dimension Door
  * Spell: Flaming Sphere
  * Spell: Healing Spirit
  * Spell: Mage Hand
  * Spell: Maximilian's Earthen Grasp
  * Spell: Misty Step
  * Spell: Moonbeam
  * Spell: Protection from Evil - no longer need world script
  * Spell: Sleep
  * Spell: Spiritual Weapon
  * Spell: Tasha's Caustic Brew
  * Subclass: Bladesinging
  * Warlock: Accursed Specter
  * Warlock: Celestial Resilience
  * Warlock: Genies Wrath
  * Warlock: Healing Light
  * Warlock: Hex Warrior
  * Warlock: Genie Kind
  * Wizard: Bladesong

* Added automation to:
  * Creature Feature: Change Shape (Large Spider) - can be easily modified for other forms
  * Creature Feature: Keen Hearing and Smell
  * Creature Feature: Keen Sight and Smell
  * Creature Feature: Sunlight Sensitivity
  * Creature Feature: Web attack
  * Monk: Perfect Self
  * Monk: Quickened Healing
  * Rogue: Steady Aim

# 10.0.4
* Fixed/Updated for v10:
  * Barbarian: Brutal Critical
  * Barbarian: Danger Sense
  * Barbarian: Fast Movement
  * Barbarian: Indomitable Might
  * Barbarian: Persistent Rage
  * Barbarian: Primal Path
  * Barbarian: Rage
  * Barbarian: Reckless Attack
  * Barbarian: Relentless Rage
  * College of Shadows: Dash through the Shadows
  * Ranger: Deft Explorer
  * Ranger: Favored Foe
  * Rogue: Sneak Attack - Rakish Audacity and Insightful Fighting
  * Shadowdancer: Shadow Dance
  * Shadowdancer: Shadow Sight
  * Shadowdancer: Shadow Veil
  * Sorcerer: Shadow Walk
  * Way of the Shadow: Shadow Step
  * Creature: Fathomer
  * Feat: Charger
  * Feat: Crusher
  * Feat: Healer
  * Feat: Piercer
  * Feat: Shield Master
  * Feat: Slasher
  * Feat: Telekinetic
  * Item: Drow Poison
  * Item: Poisonous Snake Venom
  * Item: Purple Worm Poison
  * Item: Serpent Venom
  * Item: Spider Poison
  * Item: Wyvern Poison
  * Metamagic: Empowered Spell
  * Spell: Chromatic Orb
  * Spell: Flame Blade
  * Spell: Frostbite
  * Spell: Ray of Frost
  * Spell: Shadow Blade
  * Spell: Shillelagh
  * Spell: Spirit Guardians

* Added automation to:
  * Combat Maneuver: Bait and Switch
  * Item: Grapple Action
  * Item: Driftglobe
  * Spell: Bounding Boulder
  * Spell: Thorn Whip
  * Spell: Vampiric Touch
  * Spell: Zephyr Strike

# 10.0.3
* Fixed/Updated for v10:
  * Arcane Recovery
  * Blessing of the Forge
  * Elegant Maneuver
  * Favored by the Gods
  * Font of Magic
  * Hexblade's Curse - need to test
  * Combat Maneuver: Ambush
  * Combat Maneuver: Brace
  * Combat Maneuver: Commander's Strike
  * Combat Maneuver: Commanding Presence
  * Combat Maneuver: Disarming Attack
  * Combat Maneuver: Distracting Strike
  * Combat Maneuver: Evasive Footwork
  * Combat Maneuver: Feinting Attack
  * Combat Maneuver: Goading Attack
  * Combat Maneuver: Grappling Strike
  * Combat Maneuver: Lunging Attack
  * Combat Maneuver: Maneuvering Attack
  * Combat Maneuver: Menacing Attack
  * Combat Maneuver: Parry
  * Combat Maneuver: Precision Attack
  * Combat Maneuver: Pushing Attack
  * Combat Maneuver: Quick Toss
  * Combat Maneuver: Rally
  * Combat Maneuver: Riposte
  * Combat Maneuver: Sweeping Attack
  * Combat Maneuver: Tactical Assessment
  * Combat Maneuver: Trip Attack
  * Feat: Great Weapon Master - prompt on attacks
  * Feat: Sharpshooter - prompt on attacks
  * Feat: Added Draconic Breath which replaces the homebrew feat 'Breath of the Dragon'
  * Item: Adamantine Armor critical immunity
  * Item: Bracers of Archery
  * Item: Figurine of Wondrous Power (Silver Raven)
  * Spell: Conjure Minor Elementals
  * Spell: Dimension Door
  * Spell: Mage Hand
  * Spell: Melf's Acid Arrow
  * Spell: Mirror Image
  * Spell: Misty Step
  * Spell: Spiritual Weapon
  * Spell: Thunderwave

# 10.0.2
* Fixed/Updated for v10:
  * Champion subclass features
  * Circle of the Elements subclass features
  * Druid class features
  * Fighting Style: Great Weapon Fighting
  * Item: Storm Boomerang
  * Item: Seeker Dart
  * Race: Custom Lineage
  * Spell: Call Lightning
  * Spell: Chill Touch
  * Spell: Conjure Animals
  * Spell: Fire Shield
  * Spell: Flaming Sphere
  * Spell: Goodberry
  * Spell: Healing Spirit
  * Spell: Maximilian's Earthen Grasp
  * Spell: Moonbeam
  * Spell: Shocking Grasp
  * Spell: Spike Growth
  * Spell: Wysard's Snowball
  * Wildshape
  * World Protection from Evil script

# 10.0.1
* Fixed/Updated for v10:
  * Sneak Attack
  * Rakish Audacity
  * Uncanny Dodge
  * Indomitable
  * Panache
  * Variant Tiefling
  * Bardic Inspiration
  * Wand of Magic Missiles
  * Metallic Dragonborn features
  * Lay on Hands
  * Divine Smite
  * Oath of Vengeance features
  * Spell: Arms of Hadar
  * Spell: Faerie Fire
  * Spell: Green-Flame Blade
  * Spell: Heat Metal
  * Spell: Hellish Rebuke
  * Spell: Heroism
  * Spell: Hex
  * Spell: Hold Person
  * Spell: Hunter's Mark
  * Spell: Invisibility
  * Spell: Lesser Restoration
  * Spell: Magic Missile
  * Spell: Misty Step
  * Spell: Searing Smite
  * Spell: Thunderous Smite
  * Spell: Wrathful Smite

# 10.0.0
#### The main focus of this release is to migrate to V10

* V10 Fixed/Updated:
  * All spell icons
  * All item icons
  * Consolidation & resize of many item images
  * Channel Divinity: Turn Undead
  * Spell: Word of Radiance
  * Spell: Earthbind
  * Spell: Intellect Fortress
  * Spell: Invulnerability
  * Potions of healing

# 0.3.5
* Fixed/Updated:
  * Forge Domain: Blessing of the Forge

# 0.3.4
* Added automation to:
  * Spell: Mind Sliver

* Fixed/Updated:
  * Forge Domain: Blessing of the Forge

* Added:
  * Items: 
    * Wooden Shield and magical variants
    
* Notes
  * You must configure permissions to allow players to create actors and items for some automation to work correctly 

# 0.3.3
* Added automation to:
  * Swashbuckler
  * all Eldritch Invocations

* Fixed/Updated:
  * Healing Hands
  * Rage
  * World Protection from Evil script
  * Spell: Chill Touch

* Added:
  * Creature Features compendium
    * Pack Tactics
  * Items:
    * Silvered arrows and crossbow bolts
    * Reszur
    * Poisonous Snake Venom (injury)
    * Spider Poison (injury)
    * Drow Poison (injury)
    * Purple Worm Poison (Injury)
    * Serpent Venom (Injury)
    * Wyvern Poison (Injury)

# 0.3.2
* Added automation to:
  * Spell: Gift of Alacrity
  * Spell: Tasha's Caustic Brew
  * The Hexblade

* Fixed/Updated:
  * Air Genasi movement trait
  * Dual Wielder feat armor class bonus
  * Spell: Shield
  * Spell: Hex
  * Spell: Chill Touch
  * Heavy Armor Master
  * Cloak of Displacement

* Added:
  * Variant Tiefling
  * Hooded cloak
  * Bard College of Shadows

# 0.3.1
* Added automation to:
  * Divine Soul
  * Bladesinging
  * College of Valor - need to improve combat inspiration
  * Life Domain
  * Tempest Domain - in progress

* Fixed/Updated:
  * Lay on Hands

# 0.3.0
* Added automation to:
  * Forge Domain: Blessing of the Forge, Soul of the Forge, Divine Strike, Saint of Forge and Fire
  * Protection from Evil and Good (requires world script)
  * Alchemist's Fire
  * Holy Water
  * Antitoxin
  * Healer's Kit
  * Spare the Dying

* Fixed/Updated:
  * Added back in the Divine Domain feature for Clerics
  * Word of Radiance
  * Acid Vial

# 0.2.9
* Updated readme
* Added transparent webp letter and number tokens

# 0.2.8
* Added automation to:
  * Kobold racial features
  * Oath of Vengeance features

* Fixed/Updated:
  * Spell: Darkness
  * Detect Magic
  * Divine Favor
  * Thunderous Smite
  * Wrathful Smite
  * Branding Smite
  * Searing Smite
  * Spiritual Weapon

# 0.2.7
* Added automation to:
  * Aasimar racial features
  * Empowered Cantrips
  * Potent Cantrip
  * Potent Cantrips
  * Deadly Caster

* Fixed/Updated:
  * Fixed the Sorcerer proficiencies, so you can now select your spellcasting ability
  * Reckless Attack
  * Vicious Mockery
  
# 0.2.6
* Added missing features:
  * Oath of Glory: Peerless Athlete, Inspiring Smite
  
* Fixed/Updated:
  * Disarming Strike
  * Damage application of all the maneuvers that add the superiority die to damage
  * Broken item generic image links
  * Spell: Absorb Elements
  * Monster: all swarms' damage rolls

* Added automation to:
  * Spell: Conjure Animals (requires importing the tables and giving players perms to add actors and tokens) 
  * Elegant Maneuver
  * Oath of Glory features except 'Living Legend'
  * Path of the Ancestral Guardian

# 0.1.0
* Completed initial cleanup of content.

# 0.0.5
* Cleanup of creatures

# v0.0.4
* Cleanup of classes, subclasses, class-features, and backgrounds. Started cleaning up creatures.

# v0.0.3
* Cleanup work on races and racial traits

# v0.0.2
* Lots of package cleanup

# v0.0.1
* Initial data
