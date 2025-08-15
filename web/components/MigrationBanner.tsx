import React, { useState, useEffect } from 'react';
import { migrationService } from '~/services/migrationService';

interface MigrationStatus {
  needsMigration: boolean;
  totalTasks: number;
  parentTasks: number;
  childTasks: number;
}

export const MigrationBanner: React.FC = () => {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    migrated: number;
    errors: number;
  } | null>(null);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const migrationStatus = await migrationService.getMigrationStatus();
      setStatus(migrationStatus);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const handleMigration = async () => {
    if (!status?.needsMigration) return;

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrationService.migrateSubtasks();
      setMigrationResult(result);
      
      // Refresh status after migration
      await checkMigrationStatus();
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({ migrated: 0, errors: 1 });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!status || !status.needsMigration) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Subtask Structure Update Required
          </h3>
          
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              We've updated how subtasks are stored to ensure compatibility between web and mobile apps.
              You have <strong>{status.childTasks} subtasks</strong> that need to be migrated.
            </p>
            
            {migrationResult && (
              <div className="mt-2 p-2 bg-white rounded border">
                {migrationResult.migrated > 0 && (
                  <p className="text-green-600">
                    ✅ Successfully migrated {migrationResult.migrated} parent tasks
                  </p>
                )}
                {migrationResult.errors > 0 && (
                  <p className="text-red-600">
                    ❌ {migrationResult.errors} errors occurred during migration
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleMigration}
              disabled={isMigrating}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isMigrating ? 'Migrating...' : 'Migrate Now'}
            </button>
            
            <button
              type="button"
              onClick={() => setStatus(null)}
              className="ml-3 text-yellow-700 hover:text-yellow-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


