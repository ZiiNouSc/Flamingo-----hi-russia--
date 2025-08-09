import React from 'react';
import PageHeader from '../../components/common/PageHeader';

const AgencyApproval: React.FC = () => {
  return (
    <div>
      <PageHeader title="Validation en attente" />
      <div className="bg-white rounded-lg shadow-md p-8 text-center mt-8">
        <h3 className="text-lg font-medium text-navy-900 mb-2">Votre profil agence est en attente de validation</h3>
        <p className="text-navy-600 mb-4">
          Un administrateur doit valider votre profil avant que vous puissiez accéder à toutes les fonctionnalités.
        </p>
        <p className="text-navy-500">Vous recevrez un email dès que votre compte sera approuvé.</p>
      </div>
    </div>
  );
};

export default AgencyApproval; 