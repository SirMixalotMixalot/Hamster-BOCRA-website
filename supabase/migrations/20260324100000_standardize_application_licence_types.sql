-- Add check constraint to enforce canonical BOCRA licence types
-- This ensures all new applications use the standardized licence type list

begin;

-- Drop the existing constraint if it exists (safe with if exists pattern)
alter table public.applications 
drop constraint if exists applications_licence_type_check;

-- Add new constraint with canonical BOCRA licence types
alter table public.applications 
add constraint applications_licence_type_check check (
  licence_type in (
    'Aircraft Radio Licence',
    'Amateur Radio License',
    'Broadcasting Licence',
    'Cellular Licence',
    'Citizen Band Radio Licence',
    'Point-to-Multipoint Licence',
    'Point-to-Point Licence',
    'Private Radio Communication Licence',
    'Radio Dealers Licence',
    'Radio Frequency Licence',
    'Satellite Service Licence',
    'Type Approval Licence',
    'VANS Licence'
  )
);

commit;
