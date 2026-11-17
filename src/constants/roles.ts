import type { Role } from '@/services/api';

/** Texts and routes that change between the professores and alunos screens. */
export const RoleConfig = {
  professor: {
    singular: 'professor',
    plural: 'Professores',
    newLabel: 'Novo professor',
    listHref: '/professores',
    newHref: '/professores/new',
    editPath: '/professores/[id]/edit',
  },
  aluno: {
    singular: 'aluno',
    plural: 'Alunos',
    newLabel: 'Novo aluno',
    listHref: '/alunos',
    newHref: '/alunos/new',
    editPath: '/alunos/[id]/edit',
  },
} as const satisfies Record<Role, object>;
